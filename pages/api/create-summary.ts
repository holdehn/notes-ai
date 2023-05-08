import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIChat } from 'langchain/llms/openai';
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from 'langchain/prompts';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { loadSummarizationChain } from 'langchain/chains';

// Get the environment variables
const wolframAlphaAppId = process.env.WOLFRAM_ALPHA_APP_ID;
const serpApiKey = process.env.SERP_API_KEY;
const openAIApiKey = process.env.OPENAI_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Get the transcription from the request body
  const { transcription } = req.body;

  if (!transcription || transcription.length === 0) {
    return res.status(400).json({ message: 'No transcription in the request' });
  }

  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 2000 });
  const docs = await textSplitter.createDocuments([transcription]);

  const llm = new OpenAIChat({
    openAIApiKey: openAIApiKey,
    maxTokens: 250,
    modelName: 'gpt-3.5-turbo',
    temperature: 0,
  });

  const systemPromptTemplate = SystemMessagePromptTemplate.fromTemplate(
    `You are a helpful teacher assistant that helps a student named {name}. The topic of the lecture is {topic}. Summarize information from a transcript of a lecture.
    Your goal is to write a summary from the perspective of {name} that will highlight key points that will be relevant to learning the material.
    Do not respond with anything outside of the call transcript. If you don't know, say, "I don't know"
    Do not repeat {name}'s name in your output
    `,
  );

  const humanPromptTemplate = HumanMessagePromptTemplate.fromTemplate(`{text}`);

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    systemPromptTemplate,
    humanPromptTemplate,
  ]);

  const chain = loadSummarizationChain(llm, {
    prompt: chatPrompt,
  });

  const output = await chain.call({
    input_documents: docs,
  });
  return res.status(200).json({ data: output });
}
