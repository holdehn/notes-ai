import React, { useState } from 'react';
import MathInput from '../MathInput';
import { useCallback } from 'react';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Message } from '@/types/chat';

function useForm(initialValues: { comment: string; subject: string }) {
  const [values, setValues] = useState(initialValues);
  const handleChange = (e: { target: { name: any; value: any } }) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setValues(initialValues);
  };

  return { values, handleChange, resetForm, setValues };
}
export default function TextInput() {
  const [responseText, setResponseText] = useState('');
  const { values, handleChange, resetForm, setValues } = useForm({
    comment: '',
    subject: '',
  });

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log('Submitted:', values);
    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: values.comment,
        subject: values.subject,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setResponseText(JSON.stringify(data));
      });
    resetForm();
  };

  const handleSymbolInsert = (symbol: string) => {
    const commentInput = document.getElementById(
      'comment',
    ) as HTMLTextAreaElement;
    const start = commentInput.selectionStart;
    const end = commentInput.selectionEnd;

    const updatedValue = [
      values.comment.slice(0, start),
      symbol,
      values.comment.slice(end),
    ].join('');

    setValues({ ...values, comment: updatedValue });

    commentInput.focus();
    commentInput.selectionEnd = start + symbol.length;
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 p-8 "
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Ask a question
        </h1>
        <div className="grid gap-6 mb-6 mx-4 justify-center ">
          <div className="mt-4 ">
            <input
              type="text"
              id="subject"
              name="subject"
              className="bg-gray-50 border max-w-xs border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Enter subject"
              required
              value={values.subject}
              onChange={handleChange}
            />

            <div className="mb-4">
              <MathInput onSymbolInsert={handleSymbolInsert} />
            </div>
          </div>
        </div>

        <div className="py-2 bg-white rounded-t-lg dark:bg-gray-800 mx-4">
          <label htmlFor="comment" className="sr-only">
            Your comment
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={6}
            className="w-full px-4 py-2 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:border-none focus:outline-none focus:ring-0 dark:text-white dark:placeholder-gray-400"
            placeholder="Ask a question or enter a homework problem..."
            required
            value={values.comment}
            onChange={handleChange}
          />
        </div>
        <div className="flex items-center justify-center px-3 py-2 border-t dark:border-gray-600">
          <button
            type="submit"
            className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-green-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
          >
            Submit
          </button>
        </div>
      </form>
      <div className="mt-4 text-gray-900 dark:text-white">
        <h2 className="text-xl font-bold">Response:</h2>
        <p>{responseText}</p>
      </div>

      <p className="ml-auto text-xs text-gray-500 dark:text-gray-400">
        Powered by OpenAI and Langchain. Made by{' '}
        <a
          href="https://twitter.com/holdehnj"
          className="text-blue-600 dark:text-blue-500 hover:underline"
        >
          @holdehnj
        </a>
        .
      </p>
    </>
  );
}
