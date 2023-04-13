import React, { useEffect, useState } from 'react';
import TranscriptionResult from '../TranscriptionResult/TranscriptionResult';

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

const TextWriter = ({ text = '', delay }: any) => {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentChar = text.charAt(index);
      const nextChar = text.charAt(index + 1);
      setDisplayText((prevDisplayText) => {
        if (currentChar === '.' && nextChar !== ' ') {
          return prevDisplayText + currentChar + ' ';
        }
        return prevDisplayText + currentChar;
      });
      setIndex((prevIndex) => prevIndex + 1);
    }, delay);

    return () => clearInterval(timer);
  }, [text, delay, index]);

  return <div>{displayText}</div>;
};
export default function NotesForm() {
  const [file, setFile] = useState<File | null>(null);
  const [convertedText, setConvertedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInputs, setShowInputs] = useState(true); // Add this line
  const [notesText, setNotesText] = useState(''); // Add this line
  const { values, handleChange, resetForm, setValues } = useForm({
    comment: '',
    subject: '',
  });

  const handleFile = async (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setFile(file);

      if (file.size > 25 * 1024 * 1024) {
        alert('Please upload an audio file less than 25MB');
        return;
      }
    }
  };

  const sendAudio = async () => {
    setLoading(true);
    try {
      if (!file) {
        alert('Please upload an audio file');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/transcribe', {
        method: 'POST',

        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.log('errpr' + JSON.stringify(errorData));
        throw new Error(errorData.message);
      }

      const data = await res.json();

      setLoading(false);
      setConvertedText(JSON.stringify(data.transcript.text));
    } catch (error: any) {
      console.log(JSON.stringify(error));
      setLoading(false);
      alert(`Error: ${error.message}`);
    }
  };
  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!showInputs) {
      resetForm();
      setShowInputs(true);
      setConvertedText('');
      setFile(null);
      return;
    }

    sendAudio();
  };

  const handleGenerate = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log('Submitted:', values);
    fetch('/api/create-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcription: convertedText,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setNotesText(JSON.stringify(data));
      });
    resetForm();
  };

  return (
    <>
      <header className="bg-gray-950 flex items-center justify-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Generate Notes
        </h1>
      </header>
      <form
        onSubmit={handleSubmit}
        className="w-full mb-4 mt-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 p-8 "
      >
        <div className="grid gap-6 mb-6 mx-4 justify-center">
          <div className="mt-4">
            {showInputs && (
              <>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="bg-gray-50 border max-w-xs border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Enter a subject or topic"
                  required
                  value={values.subject}
                  onChange={handleChange}
                />
                <div className="space-y-4 mt-2">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleFile}
                    className="w-full text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                  />
                </div>
              </>
            )}

            {file && (
              <>
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <TextWriter text={file.name} delay={40} />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-center px-3 py-2 border-t dark:border-gray-600">
            <button
              type="submit"
              className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-green-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
            >
              Transcribe
            </button>
          </div>
          {convertedText && (
            <div className="flex items-center justify-center px-3 py-2 border-t dark:border-gray-600">
              <button
                onClick={handleGenerate}
                className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-green-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
              >
                Generate Notes
              </button>
            </div>
          )}
        </div>
        {convertedText && <TranscriptionResult transcription={convertedText} />}
        {notesText && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Notes:</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{notesText}</p>
          </div>
        )}
      </form>
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
