import React, { useState } from 'react';
import MathInput from 'components/ui/MathInput';

const ChatBox = ({ updateActivityArray, updateTimelineArray }: any) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      updateActivityArray({ type: 'input', content: input }, true);

      const response = await fetch('/api/live-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: input }),
      });
      const data = await response.json();
      console.log('Submission result:', data);

      updateActivityArray({ type: 'response', content: data.output });
      updateTimelineArray(data.intermediateSteps);
      setInput('');
    } catch (error) {
      console.error('Error submitting chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymbolInsert = (symbol: string | any[]) => {
    const commentInput = document.getElementById(
      'input',
    ) as HTMLTextAreaElement;
    const start = commentInput.selectionStart;
    const end = commentInput.selectionEnd;

    const updatedValue = [input.slice(0, start), symbol, input.slice(end)].join(
      '',
    );

    setInput(updatedValue);

    commentInput.focus();
    commentInput.selectionEnd = start + symbol.length;
  };

  return (
    <div className="p-8">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <MathInput onSymbolInsert={handleSymbolInsert} />
          <textarea
            id="input"
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-4 focus:outline-none focus:border-indigo-500 resize-none"
            placeholder="Enter your message..."
          />
          <button
            type="submit"
            className="absolute bottom-0 right-0 mb-4 mr-4 bg-indigo-500 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
