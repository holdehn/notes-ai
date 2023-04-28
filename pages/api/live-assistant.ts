import type { NextApiRequest, NextApiResponse } from 'next';
import { Tool, ZeroShotAgent } from 'langchain/agents';
import { OpenAIChat } from 'langchain/llms/openai';
import { initializeAgentExecutor } from 'langchain/agents';
import { DynamicTool, SerpAPI } from 'langchain/tools';
import { Calculator } from 'langchain/tools/calculator';
import { PromptTemplate } from 'langchain/prompts';

// Get the environment variables
const wolframAlphaAppId = process.env.WOLFRAM_ALPHA_APP_ID;
const serpApiKey = process.env.SERP_API_KEY;
const openAIApiKey = process.env.OPENAI_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Get the transcription from the request body
  const { transcript } = req.body;

  if (!transcript || transcript.length === 0) {
    return res.status(400).json({ message: 'No transcription in the request' });
  }

  const tools: Tool[] = [];

  //load serp tool
  if (serpApiKey) {
    tools.push(new SerpAPI(serpApiKey));
  }

  //load calculator tool
  tools.push(new Calculator());

  //agent, and llm
  const llm = new OpenAIChat({
    openAIApiKey: openAIApiKey,
    modelName: 'gpt-4',
    temperature: 0.1,
    maxTokens: 100,
  });
  const agentExecutor = await initializeAgentExecutor(
    tools,
    llm,
    'chat-zero-shot-react-description',
    true,
  );

  const promptTemplate = PromptTemplate.fromTemplate(
    `Given the current transcription of a conversation, identify important topics and generate an important fact or responses relevant to the conversation.
      Be concise and be polite.
     Transcription: {transcription}.
`,
  );
  const result = await agentExecutor.call({
    promptTemplate,
    input: [transcript],
    maxTokens: 100,
  });
  console.log('result', JSON.stringify(result));

  res.json(result);
}
