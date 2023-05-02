import { serve } from 'https://deno.land/std@0.160.0/http/server.ts';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from 'https://esm.sh/langchain@0.0.67/prompts';
import { RecursiveCharacterTextSplitter } from 'https://esm.sh/langchain@0.0.67/text_splitter';
import { ConsoleCallbackHandler } from 'https://esm.sh/langchain@0.0.67/callbacks';
import { OpenAIChat } from 'https://esm.sh/langchain@0.0.67/llms/openai';
import { corsHeaders } from '../_shared/cors.ts';
import { loadSummarizationChain } from 'https://esm.sh/langchain@0.0.67/chains';

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
  console.log(OPENAI_API_KEY);
  try {
    const { transcription } = await req.json();
    console.log(transcription);
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    const docs = await textSplitter.createDocuments([transcription]);
    console.log(docs);

    const streaming = req.headers.get('accept') === 'text/event-stream';
    console.log('streaming', streaming);
    const consoleHandler = new ConsoleCallbackHandler();

    const llm = new OpenAIChat({
      streaming,
      openAIApiKey: OPENAI_API_KEY,
      maxTokens: 400,
      modelName: 'gpt-4',
      temperature: 0,
      callbacks: [consoleHandler],
    });
    console.log('llm', llm);
    const chain = loadSummarizationChain(llm, {
      prompt: prompt,
    });
    console.log('chain', chain);

    const { writable, readable } = new TransformStream();

    const response = new Response(readable, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

    chain.call({ input_documents: docs }).then((result) => {
      console.log(result);
      const encoder = new TextEncoder();
      writable
        .getWriter()
        .write(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
      writable.getWriter().close();
    });
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
