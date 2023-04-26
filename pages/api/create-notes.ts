import type { NextApiRequest, NextApiResponse } from 'next';
import { Tool, ZeroShotAgent } from 'langchain/agents';
import { OpenAI } from 'langchain/llms/openai';
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
  const { transcription } = req.body;

  if (!transcription || transcription.length === 0) {
    return res.status(400).json({ message: 'No transcription in the request' });
  }

  // Set the response headers

  // Set the response headers
  // res.writeHead(200, {
  //   'Content-Type': 'text/event-stream',
  //   'Cache-Control': 'no-cache, no-transform',
  //   Connection: 'keep-alive',
  // });

  // // Send the data to the client
  // const sendData = (data: string) => {
  //   res.write(`data: ${data}\n\n`);
  // };

  // sendData(JSON.stringify({ data: '' }));

  //load wolfram tool, wolfram tool from langchain n/a on typescript so i make api call
  const tools: Tool[] = [];

  //load serp tool
  if (serpApiKey) {
    tools.push(new SerpAPI(serpApiKey));
  }

  //load calculator tool
  tools.push(new Calculator());

  //agent, and llm
  const llm = new OpenAI({
    openAIApiKey: openAIApiKey,
    maxTokens: 400,
    modelName: 'gpt-3.5-turbo',
  });
  const agentExecutor = await initializeAgentExecutor(
    tools,
    llm,
    'chat-zero-shot-react-description',
    true,
  );

  const promptTemplate = PromptTemplate.fromTemplate(
    `Given a transcription, take notes and summarize important topics. Your goal is to help the user understand the transcription and remember the important topics. Respond with everything important that the user should remember. You can use the following tools to help you: Google search
     {end}`,
  );
  const result = await agentExecutor.call({
    promptTemplate,
    input: [transcription],
    maxTokens: 400,
    temperature: 0.9,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    bestOf: 1,
    n: 1,
    stream: true,
    logprobs: 0,
    stop: ['\u2029'],
    echo: false,
    output: true,
  });
  console.log('result' + result.output);
  //string and parse result so i can view

  console.log('result' + result.summary);
  console.log(JSON.stringify(result));

  return res.status(200).json(result.output);
}
