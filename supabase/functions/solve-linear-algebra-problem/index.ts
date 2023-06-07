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
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { createClient } from 'https://esm.sh/v117/@supabase/supabase-js@2.21.0/dist/module/index';
import { z } from 'https://deno.land/x/zod@v3.21.4/mod.ts';
import { StructuredOutputParser } from 'langchain/output_parsers';

type QuestionSchemaType = {
  label: string;
  question: string;
};

const questionSchema = z.object<QuestionSchemaType>({
  label: z.string(),
  question: z.string(),
});

type ParsedLatexSchemaType = {
  title: string;
  teacher_name: string;
  student_name: string;
  questions: QuestionSchemaType[];
};

const parsedLatexSchema = z.object<ParsedLatexSchemaType>({
  title: z.string(),
  teacher_name: z.string(),
  student_name: z.string(),
  questions: z.array(questionSchema),
});

const parser = new StructuredOutputParser(parsedLatexSchema);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    // Supabase API URL - env var exported by default when deployed.
    Deno.env.get('SUPABASE_URL') ?? '',
    // Supabase API ANON KEY - env var exported by default when deployed.
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    },
  );

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  try {
    const { latex } = await req.json();

    //first parse questions
    const { questions } = parser.parse(latex);
    console.log(JSON.stringify(questions));

    const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });

    const selectedDocs = closestIndices.map((index) => docs[index]);

    const llm = new OpenAIChat({
      openAIApiKey: OPENAI_API_KEY,
      maxTokens: 1200,
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
      streaming: true,
      timeout: 120000,
    });
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const chain = loadSummarizationChain(llm, {
      combineMapPrompt: summaryPrompt,
      type: 'map_reduce',
      combinePrompt: combineSummaryPrompt,
    });
    let fullSummary = '';

    chain
      .call(
        {
          llm,
          input_documents: selectedDocs,
        },
        [
          {
            handleLLMNewToken: async (token) => {
              try {
                await writer.ready;

                await writer.write(encoder.encode(`data: ${token}\n\n`));
                fullSummary += token;
              } catch (e) {
                console.error(e);
              }
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

function euclideanDistance(vecA: number[], vecB: number[]): number {
  return Math.sqrt(
    vecA.reduce((acc, val, i) => acc + Math.pow(val - vecB[i], 2), 0),
  );
}

const summaryPromptTemplate = SystemMessagePromptTemplate.fromTemplate(
  `You will be given a single passage of a document. This section will be enclosed in triple backticks (\`\\\`\\\`).
  Your goal is to give a concise summary of this section so that a reader will have a full understanding of the excerpt.
  Your response should be at least three paragraphs and fully encompass what was said in the passage.
  
  \\\`\\\`\\\`{text}\\\`\\\`\\\`
  FULL SUMMARY:
  `,
);

const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate(`{text}`);
const summaryPrompt = ChatPromptTemplate.fromPromptMessages([
  summaryPromptTemplate,
  humanPromptTemplate,
]);

const reducePrompt = SystemMessagePromptTemplate.fromTemplate(`
You will be given a series of summaries from a text. The summaries will be enclosed in triple backticks (\`\\\`\\\`).
Your goal is to give a verbose summary of the given text.
The reader should be able to understand the text as a whole.

\\\`\\\`\\\`{text}\\\`\\\`\\\`
VERBOSE SUMMARY:
`);
const humanPromptTemplate2 = HumanMessagePromptTemplate.fromTemplate(`{text}`);

const combineSummaryPrompt = ChatPromptTemplate.fromPromptMessages([
  reducePrompt,
  humanPromptTemplate2,
]);
