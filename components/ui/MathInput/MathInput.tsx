// MathInput.tsx
import React, { useState } from 'react';

const specialSymbols = [
  'π',
  '°',
  '∞',
  '∀',
  '∃',
  '∪',
  '≤',
  '≥',
  '≠',
  'θ',
  'Δ',
  'π',
  '∞',
];
interface MathInputProps {
  onValueChange?: (value: string) => void;
  onSymbolInsert?: (symbol: string) => void; // New prop
}

const MathInput: React.FC<MathInputProps> = ({
  onValueChange,
  onSymbolInsert,
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleSymbolClick = (symbol: string) => {
    if (onSymbolInsert) {
      onSymbolInsert(symbol); // Use the new prop
    } else {
      setInputValue((prevValue) => prevValue + symbol);
      if (onValueChange) {
        onValueChange(inputValue + symbol);
      }
    }
  };

  return (
    <div>
      <div className="mt-2">
        <label htmlFor="symbol-select" className="sr-only">
          Symbols
        </label>
        <select
          id="symbol-select"
          className="bg-gray-50 border max-w-xs border-gray-300 text-gray-400 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400  dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={(e) => handleSymbolClick(e.target.value)}
          value=""
        >
          <option value="">Special Characters</option>
          {specialSymbols.map((symbol) => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MathInput;
