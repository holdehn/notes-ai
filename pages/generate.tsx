import { useState, ChangeEvent, useEffect } from 'react';
import DashboardComponent from '@/components/ui/DashboardComponent';
import Head from 'next/head';

const OPENAI_API_KEY = JSON.stringify(process.env.OPENAI_API_KEY);
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

// Frontend Code

export default function () {
  const [file, setFile] = useState<File | null>(null);
  const [convertedText, setConvertedText] = useState('');
  const [loading, setLoading] = useState(false);

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
      console.log('data', data);
      setLoading(false);
      setConvertedText(data.transcription);
    } catch (error: any) {
      console.log(JSON.stringify(error));
      setLoading(false);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <main>
      <Head>
        <title>UniTutor - Generate Notes</title>
        <meta name="description" content="Generate notes from your lectures" />
      </Head>
      <DashboardComponent />

      <section className="py-20 relative sm:py-24 min-h-screen bg-gray-900">
        <div className="max-w-screen-xl mx-auto px-4 text-gray-600 md:px-8">
          <div className="max-w-lg mx-auto space-y-3 sm:text-center">
            <input
              type="file"
              accept="audio/*"
              aria-label="Upload Audio"
              onChange={handleFile}
              className="bg-gray-800 text-gray-600 rounded-md px-4 py-2"
            />
            <button onClick={sendAudio} disabled={loading}>
              Send Audio
            </button>
            <div className="mt-5">
              <TextWriter text={convertedText} delay={10} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
