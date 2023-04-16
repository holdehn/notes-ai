import { Dispatch, SetStateAction } from 'react';

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
const agents = [
  {
    id: 'General',
    name: 'General',
    description: 'General Purpose Agent',
  },
  {
    id: 'Research',
    name: 'Education',
    description: 'Your personal tutor',
  },
  {
    id: 'Research',
    name: 'Research',
    description: 'Your personal sales agent',
  },

  {
    id: 'Work',
    name: 'Work',
    description: 'Customer Service Agent',
  },
];
interface Props {
  currentAgent: string;
  setCurrentAgent: Dispatch<SetStateAction<string>>;
}

export default function RadioGroup(props: Props) {
  const { currentAgent, setCurrentAgent } = props;

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAgent(event.target.value);
  };

  return (
    <fieldset>
      <legend className="sr-only">Plan</legend>
      <div className="space-y-5">
        {agents.map((agent) => (
          <label
            key={agent.id}
            htmlFor={agent.id}
            className={`relative flex items-start p-4 rounded-lg shadow-sm cursor-pointer hover:border-indigo-400 hover:shadow-lg ${
              currentAgent === agent.id
                ? 'border-indigo-400 bg-indigo-100 text-indigo-600'
                : 'border border-gray-200'
            }`}
          >
            <div className="flex h-6 items-center">
              <input
                id={agent.id}
                aria-describedby={`${agent.id}-description`}
                name="plan"
                value={agent.id}
                type="radio"
                checked={currentAgent === agent.id}
                onChange={handleRadioChange}
                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600 absolute opacity-0"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <p className="font-medium">{agent.name}</p>
              <p id={`${agent.id}-description`} className="text-gray-500">
                {agent.description}
              </p>
            </div>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
