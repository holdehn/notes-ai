import { useRef, useState, useEffect, useMemo, ChangeEvent } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import DashboardLayout from '@/components/DashboardLayout';
import Head from 'next/head';
import { convert } from 'audio-converter';

export default function () {
  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const file = e.target.files[0];

      if (file) {
        try {
          // Convert the file to WAV format
          const wavBlob = await convert(file, 'wav');

          // Create FormData
          const formData = new FormData();
          formData.append('file', wavBlob, 'audio.wav');

          const response = await fetch('/api/upload-transcribe', {
            method: 'POST',
            body: formData,
          });

          // Check if the response is OK
          if (!response.ok) {
            throw new Error(
              `Error: ${response.status} - ${response.statusText}`,
            );
          }

          // Get the transcript from the response
          const data = await response.json();
          const transcript = data.transcript;

          // Do something with the transcript
          console.log(transcript);
        } catch (error: any) {
          console.error('Error uploading file:', error.message);
        }
      } else {
        alert('Please upload a valid audio file.');
      }
    }
  }

  return (
    <main>
      <Head>
        <title>EduLink - Dashboard</title>
        <meta
          name="description"
          content="Personalized educational dashboard for students"
        />
      </Head>
      <DashboardLayout>
        <div className="mx-auto flex flex-col ">
          <h1
            className="text-2xl font-bold leading-[1.1] tracking-tighter text-center"
            style={{ color: 'white' }}
          >
            NotesAI
          </h1>
          <div className="text-center mt-4">
            <label
              htmlFor="upload-button"
              className="bg-red-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded cursor-pointer"
            >
              Upload Audio File
            </label>
            <input
              type="file"
              id="upload-button"
              className="hidden"
              accept="audio/mp3, audio/mpeg, audio/wav, audio/ogg"
              onChange={(e) => handleFileUpload(e)}
            />
          </div>
          <main className={styles.main}></main>
        </div>
      </DashboardLayout>
    </main>
  );
}
