import { serve } from 'https://deno.land/std@0.160.0/http/server.ts'; //@ts-ignore
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from 'https://esm.sh/langchain@0.0.66/prompts';
import { RecursiveCharacterTextSplitter } from 'https://esm.sh/langchain@0.0.66/text_splitter';
import { CallbackManager } from 'https://esm.sh/langchain@0.0.66/callbacks';
import { ChatOpenAI } from 'https://esm.sh/langchain@0.0.66/chat_models/openai';
import { corsHeaders } from '../_shared/cors.ts';
import { loadSummarizationChain } from 'https://esm.sh/langchain@0.0.66/chains';

const systemPromptTemplate = SystemMessagePromptTemplate.fromTemplate(
  `You are a helpful teacher assistant that helps a student named {name}. The topic of the lecture is {topic}. Summarize information from a transcript of a lecture.
  Your goal is to write a summary from the perspective of {name} that will highlight key points that will be relevant to learning the material.
  Do not respond with anything outside of the call transcript. If you don't know, say, "I don't know"
  Do not repeat {name}'s name in your output
  `,
);

const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate('{input}');

const prompt = ChatPromptTemplate.fromPromptMessages([
  systemPromptTemplate,
  humanPromptTemplate,
]);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

  try {
    const { transcription } = await req.json();
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    const docs = await textSplitter.createDocuments([transcription]);

    // Check if the request is for a streaming response.
    const streaming = req.headers.get('accept') === 'text/event-stream';

    if (streaming) {
      // For a streaming response we need to use a TransformStream to
      // convert the LLM's callback-based API into a stream-based API.
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();

      const llm = new ChatOpenAI({
        streaming,
        openAIApiKey: OPENAI_API_KEY,
        maxTokens: 400,
        modelName: 'gpt-4',
        temperature: 0,

        callbackManager: CallbackManager.fromHandlers({
          handleLLMNewToken: async (token: any) => {
            await writer.ready;
            await writer.write(encoder.encode(`data: ${token}\n\n`));
          },
          handleLLMEnd: async () => {
            await writer.ready;
            await writer.close();
          },
          handleLLMError: async (e) => {
            await writer.ready;
            await writer.abort(e);
          },
        }),
      });

      const chain = loadSummarizationChain(llm, {
        prompt: prompt,
      });

      chain
        .call({
          input_documents: docs,
        })
        .catch((e) => {
          console.error(e);
        });
      return new Response(stream.readable, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    } else {
      const llm = new ChatOpenAI({
        streaming,
        openAIApiKey: OPENAI_API_KEY,
        maxTokens: 400,
        modelName: 'gpt-4',
        temperature: 0,
      });
      const chain = loadSummarizationChain(llm, {
        prompt: prompt,
      });
      const result = await chain.call({
        input_documents: docs,
      });
      return new Response(JSON.stringify(result), { headers: corsHeaders });
    }
  } catch (e) {
    console.error(e);
    return new Response(e.message, { status: 500 });
  }
});
