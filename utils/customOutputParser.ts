// customOutputParser.ts

export function getFormatInstructions(): string {
  return `Use the following format:
    Question: the input question you must answer.
    Thought: you should always think about how to solve the problem.
    Action: the action to take, should be one of [wolfram-alpha, SerpAPI, calculator]. 
    Action Input: the input to the action.
    Observation: the result of the action
    ... (this Thought/Action/Action Input/Observation can repeat N times)
    Thought: I now know the final answer. Now I will double check it.
    Final Answer: a precise answer to the input question in Markdown.`;
}

// customOutputParser.ts

export function parse(raw: string): { finalAnswer: string } {
  const regex = /Final Answer: (.+)$/m;
  const match = raw.match(regex);

  if (match) {
    return { finalAnswer: match[1].trim() };
  } else {
    console.error('Failed to parse the response:', raw);
    return { finalAnswer: 'Unable to parse the response. Please try again.' };
  }
}
