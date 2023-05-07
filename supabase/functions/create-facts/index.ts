import { serve } from 'http/server.ts';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIChat } from 'langchain/llms/openai';
import { corsHeaders } from '../_shared/cors.ts';
import { loadSummarizationChain } from 'langchain/chains';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  try {
    const { transcription, name, topic } = await req.json();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
    });

    const docs = await textSplitter.createDocuments([transcription]);

    const llm = new OpenAIChat({
      openAIApiKey: OPENAI_API_KEY,
      maxTokens: 400,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      streaming: true,
    });

    const systemPromptMap = SystemMessagePromptTemplate.fromTemplate(
      `You are a helpful assistant for {name}, a student studying {topic}, summarize information from a transcript with bullet points.
      Your goal is to write a summary from the perspective of {name} that will highlight key points that will be relevant to learning the material.
      Do not respond with anything outside of the call transcript. If you don't know, say, "I don't know"
      Do not repeat {name}'s name in your output.
  `,
    );

    const humanPromptMap = HumanMessagePromptTemplate.fromTemplate(`{text}`);

    const chatPromptMap = ChatPromptTemplate.fromPromptMessages([
      systemPromptMap,
      humanPromptMap,
    ]);

    const humanCombinedPrompt =
      HumanMessagePromptTemplate.fromTemplate(`{text}`);

    const systemCombinedPrompt = SystemMessagePromptTemplate.fromTemplate(
      `
      You are a helpful teacher assistant that helps a student {name}. The topic of the lecture is {topic}. Summarize and expand upon information from a transcript of a lecture.
      Your goal is to write informative notes from the perspective of {name} that will highlight key points that will be relevant to learning the material.
      Do not respond with anything outside of the call transcript. If you don't know, say, "I don't know"
      Do not repeat {name}'s name in your output.
      
      Respond with the following format.
      - Bullet point format 
      - Separate each bullet point with a new line
      - Each bullet point should be informative to the user and give them context about the topic
      - Each bullet point should be a complete sentence and informative to the user
      - There should be a combination longer more informative bullet points and shorter bullet points that are more concise
  
      `,
    );
    const chatbotCombinedPrompt = ChatPromptTemplate.fromPromptMessages([
      systemCombinedPrompt,
      humanCombinedPrompt,
    ]);

    const chain = loadSummarizationChain(llm, {
      combinePrompt: chatbotCombinedPrompt,
      type: 'map_reduce',
      combineMapPrompt: chatPromptMap,
    });
    console.log('chain loaded');
    chain
      .call(
        {
          llm,
          input_documents: docs,
          name: name,
          topic: topic,
        },
        [
          {
            handleLLMNewToken: async (token) => {
              await writer.ready;
              await writer.write(encoder.encode(`data: ${token}\n\n`));
            },
            handleLLMEnd: async () => {
              await writer.ready;
              console.log('end of chain');
              await writer.write(encoder.encode(`data: END_OF_SUMMARY\n\n`));
              console.log('writer closed');
              await writer.close();
            },
            handleLLMError: async (e) => {
              await writer.ready;
              await writer.abort(e);
            },
          },
        ],
      )
      .catch((e) => console.error(e));

    console.log('chain called');
    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
