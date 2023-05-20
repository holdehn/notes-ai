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
import { supabase } from '../_shared/supabase.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  try {
    const { transcription, name, topic, user_id, noteId } = await req.json();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
    });

    const docs = await textSplitter.createDocuments([transcription]);

    const llm = new OpenAIChat({
      openAIApiKey: OPENAI_API_KEY,
      maxTokens: 2000,
      modelName: 'gpt-4',
      temperature: 0,
      streaming: true,
    });

    const systemPromptMap = SystemMessagePromptTemplate.fromTemplate(
      `You are a helpful teacher assistant that helps a student named {name}. The topic of the lecture is {topic}. Summarize information from the transcript of a lecture.
      Your goal is to write a summary from the perspective of {name} that will highlight key points relevant to learning the material. 
      Do not respond with anything outside of the transcript. If you don't know, say, "I don't know".
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
      You are a helpful teacher assistant that helps a student named {name}. The topic of the lecture is {topic}. Summarize information from the transcript of a lecture.
  Your goal is to write a summary from the perspective of {name} that will highlight key points relevant to learning the material. 
  Do not respond with anything outside of the transcript. If you don't know, say, "I don't know".
  Do not repeat {name}'s name in your output.
      
      Respond with the following format.
      - Bullet point format 
      - Separate each bullet point with a new line
      - Each bullet point should be informative to the user
      - Each bullet point should be a complete sentence and informative to the user
  
      `,
    );
    const chatbotCombinedPrompt = ChatPromptTemplate.fromPromptMessages([
      systemCombinedPrompt,
      humanCombinedPrompt,
    ]);
    const chain = loadSummarizationChain(llm, {
      prompt: chatbotCombinedPrompt,
      type: 'stuff',
      // combineMapPrompt: chatPromptMap,
    });

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

              await writer.write(encoder.encode(`data: END_OF_SUMMARY\n\n`));

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
