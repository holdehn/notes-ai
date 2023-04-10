import React from 'react';

export default function () {
  return (
    <div className="grid gap-6 mb-2">
      <div>
        <label
          htmlFor="subject"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left"
        >
          Pick an option:
        </label>
        <select
          id="subject"
          className="bg-gray-50 border max-w-xs border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          required
        >
          <option value="tutor" className="text-gray-900">
            Tutor
          </option>
          <option value="generate-notes">Generate Notes</option>
        </select>
      </div>
    </div>
  );
}
