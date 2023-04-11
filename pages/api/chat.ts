import type { NextApiRequest, NextApiResponse } from 'next';
import { Tool, ZeroShotAgent } from 'langchain/agents';
import { OpenAI } from 'langchain/llms';
import { initializeAgentExecutor } from 'langchain/agents';
import { DynamicTool, SerpAPI } from 'langchain/tools';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history, subject } = req.body;

  if (!question || question.length === 0 || !subject || subject.length === 0) {
    return res.status(400).json({ message: 'No question in the request' });
  }

  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  // Get the Wolfram Alpha App ID from the environment
  const wolframAlphaAppId = process.env.WOLFRAM_ALPHA_APP_ID;
  const serpApiKey = process.env.SERP_API_KEY;
  const prompt = ZeroShotAgent.createPrompt([], {
    prefix: `The user is asking a question about ${subject}. Answer the following questions as best you can, using the following tools: `,
  });

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  });

  const sendData = (data: string) => {
    res.write(`data: ${data}\n\n`);
  };

  sendData(JSON.stringify({ data: '' }));

  const llm = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });

  //load wolfram alpha tool
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
  if (serpApiKey) {
    tools.push(new SerpAPI(serpApiKey));
  }

  const agentExecutor = await initializeAgentExecutor(
    tools,
    llm,
    'zero-shot-react-description',
    true,
  );

  try {
    // Ask a question
    const response = await agentExecutor.run(sanitizedQuestion);

    console.log('response', response);
  } catch (error) {
    console.log('error', error);
  }
}
