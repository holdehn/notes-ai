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
import { kmeans } from 'ml-kmeans';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  try {
    const { transcription, name, topic } = await req.json();
    console.log('transcription', transcription, 'name', name, 'topic', topic);
    const cleanTranscription = transcription
      .replace('\t', ' ')
      .replace('\n', ' ');

    const textSplitter = new RecursiveCharacterTextSplitter({
      separators: ['\n\n', '\n', '\t'],
      chunkSize: 3000,
      chunkOverlap: 1000,
    });

    const docs = await textSplitter.createDocuments([cleanTranscription]);

    const embeddings = new OpenAIEmbeddings({ openAIApiKey: OPENAI_API_KEY });

    let vectors: number[][] = [];
    for (let doc of docs) {
      let docEmbeddings = await embeddings.embedDocuments([doc.pageContent]);
      vectors.push(...docEmbeddings);
    }

    // Choose the number of clusters based on the length of the document.
    let numClusters = Math.ceil(cleanTranscription.length / 10000);
    numClusters = Math.min(Math.max(numClusters, 1), 10); // Ensure numClusters is between 1 and 10.

    const kmeansResult = kmeans(vectors, numClusters, {
      initialization: 'kmeans++',
    });

    let closestIndices = [];

    for (let i = 0; i < numClusters; i++) {
      let clusterIndices = kmeansResult.clusters.filter(
        (clusterIndex) => clusterIndex === i,
      );
      let centroid = kmeansResult.centroids[i];
      let minDistance = Infinity;
      let closestIndex = -1;

      for (let j = 0; j < clusterIndices.length; j++) {
        let distance = euclideanDistance(vectors[clusterIndices[j]], centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = clusterIndices[j];
        }
      }

      if (closestIndex !== -1) {
        closestIndices.push(closestIndex);
      }
    }

    const selectedDocs = closestIndices.map((index) => docs[index]);

    const llm = new OpenAIChat({
      openAIApiKey: OPENAI_API_KEY,
      maxTokens: 1500,
      modelName: 'gpt-3.5-turbo',
      temperature: 0,
      streaming: true,
      timeout: 120000,
    });
    console.log('llm', llm);
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const chain = loadSummarizationChain(llm, {
      combineMapPrompt: summaryPrompt,
      type: 'map_reduce',
      combinePrompt: combineSummaryPrompt,
    });

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
                console.log('before writer', writer);
                console.log('before writer.ready', writer.ready);
                console.log('before writer. token', token);
                await writer.ready;
                console.log('writer', writer);
                await writer.write(encoder.encode(`data: ${token}\n\n`));
                console.log('token', token);
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
