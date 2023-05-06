import { serve } from 'http/server.ts';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

import { OpenAIChat } from 'langchain/llms/openai';
import { corsHeaders } from '../_shared/cors.ts';
import { loadSummarizationChain } from 'langchain/chains';

const systemPromptTemplate = SystemMessagePromptTemplate.fromTemplate(
  `You are a helpful teacher assistant that helps a student named {name}. The topic of the lecture is {topic}. Summarize information from a transcript of a lecture.
  Your goal is to write a summary from the perspective of {name} that will highlight key points that will be relevant to learning the material.
  Do not respond with anything outside of the call transcript. If you don't know, say, "I don't know"
  Do not repeat {name}'s name in your output
  `,
);
// const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate('{input}');

const prompt = ChatPromptTemplate.fromPromptMessages([
  systemPromptTemplate,
  // humanPromptTemplate,
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  try {
    const { transcription } = await req.json();
    console.log('transcription', transcription);

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
    });

    const docs = await textSplitter.createDocuments([transcription]);

    const llm = new OpenAIChat({
      openAIApiKey: OPENAI_API_KEY,
      maxTokens: 250,
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
      streaming: true,
    });

    const name = 'holden';
    const topic = 'math';

    const chain = await loadSummarizationChain(llm, {
      combineMapPrompt: prompt,
      type: 'map_reduce',
    });

    console.log('chain loaded');
    chain
      .call(
        {
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
