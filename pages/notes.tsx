import { useState, ChangeEvent, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import TextInput from '@/components/ui/TextInput/TextInput';
import Option from '@/components/ui/Option/Option';
import NotesLayout from '@/components/ui/NotesLayout';
import NotesForm from '@/components/ui/NotesForm/NotesForm';

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
    <>
      <Head>
        <title>EduLink - Learn Anything</title>
        <meta name="description" content="Generate notes from your lectures" />
      </Head>
      <NotesLayout>
        <section className="bg-gray-950 min-h-screen">
          <main>
            <div className="max-w-screen-xl mx-auto px-4 text-gray-600 md:px-8">
              <div className="max-w-2xl mx-auto space-y-3 sm:text-center">
                <NotesForm />
              </div>
            </div>
          </main>
        </section>
      </NotesLayout>
    </>
  );
}
