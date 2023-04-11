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
  // Get the question and history from the request body
  const { question, subject } = req.body;

  if (!question || question.length === 0 || !subject || subject.length === 0) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  // Set the response headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  // Send the data to the client
  const sendData = (data: string) => {
    res.write(`data: ${data}\n\n`);
  };

  sendData(JSON.stringify({ data: '' }));

  //load wolfram tool, wolfram tool from langchain n/a on typescript so i make api call
  const tools: Tool[] = [];
  if (wolframAlphaAppId) {
    tools.push(
      new DynamicTool({
        name: 'wolfram-alpha',
        description: 'Wolfram Alpha',
        func: async (input: string) => {
          const response = await fetch(
            `https://api.wolframalpha.com/v1/result?appid=${wolframAlphaAppId}&i=${encodeURIComponent(
              input,
            )}`,
          );
          const text = await response.text();
          return text;
        },
      }),
    );
  }
  //load serp tool
  if (serpApiKey) {
    tools.push(new SerpAPI(serpApiKey));
  }

  //load calculator tool
  tools.push(new Calculator());

  //agent, and llm
  const llm = new OpenAI({ openAIApiKey: openAIApiKey });
  const agentExecutor = await initializeAgentExecutor(
    tools,
    llm,
    'zero-shot-react-description',
    true,
  );

  const PREFIX = `Figure out what the following question is trying to ask: {input}. Then answer it. You have access to the following tools: wolfram-alpha, search, calculator. You may have to reformat the input to the tools.`;
  const formatInstructions = `Use the following format:
  Question: the input question you must answer.
  Thought: you should always think about how to solve the problem.
  Action: the action to take, should be one of [wolfram-alpha, SerpAPI, calculator]. 
  Action Input: the input to the action.
  Observation: the result of the action
  ... (this Thought/Action/Action Input/Observation can repeat N times)
  Thought: I now know the final answer. Now I will double check it.
  Final Answer: a precise answer to the input question in Markdown.`;
  const SUFFIX = `Begin!
  Subject: {input}
  Question: {input}
  Thought:{agent_scratchpad}`;

  const promptTemplate = PromptTemplate.fromTemplate(
    `${PREFIX}. ${formatInstructions}.  ${SUFFIX}`,
  );

  const result = await agentExecutor.call({
    promptTemplate,
    input: [question, subject],
    maxTokens: 100,
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
  });
  sendData(JSON.stringify({ data: result }));
  res.end();
}
