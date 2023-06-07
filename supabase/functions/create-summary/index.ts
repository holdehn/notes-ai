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
  `You are a helpful teacher assistant that helps a student named {name}. The topic of the lecture is {topic}. Summarize information from the transcript of a lecture.
  Your goal is to write a summary from the perspective of {name} that will highlight key points relevant to learning the material. 
  Do not respond with anything outside of the transcript. If you don't know, say, "I don't know".
  Do not repeat {name}'s name in your output.
  `,
);
const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate(`{text}`);

const prompt = ChatPromptTemplate.fromPromptMessages([
  systemPromptTemplate,
  humanPromptTemplate,
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
    const { transcription, name, topic, user_id, noteId } = await req.json();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000,
    });

    const docs = await textSplitter.createDocuments([transcription]);

    const llm = new OpenAIChat({
      openAIApiKey: OPENAI_API_KEY,
      maxTokens: 1000,
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
      streaming: true,
    });

    const chain = loadSummarizationChain(llm, {
      combineMapPrompt: prompt,
      type: 'map_reduce',
    });
    let summary = '';

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
              summary += token;
              console.log('token add', summary);
            },
            handleLLMEnd: async () => {
              await writer.ready;
              await writer.write(encoder.encode(`data: END_OF_SUMMARY\n\n`));
              await writer.close();
              // try {
              //   console.log('fullSummary', summary);
              //   const { data, error } = await supabase
              //     .from('notes')
              //     .update({ summary })
              //     .match({ id: noteId, user_id: user_id });
              //   if (error) {
              //     console.error(error);
              //   }
              //   if (data) {
              //     console.log('data', data);
              //   }
              // } catch (e) {
              //   console.error(e);
              // }
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
