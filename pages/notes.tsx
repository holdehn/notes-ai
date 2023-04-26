import { useState, ChangeEvent, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import TextInput from '@/components/ui/TextInput/TextInput';
import Option from '@/components/ui/Option/Option';
import NotesLayout from '@/components/ui/NotesLayout';
import NotesForm from '@/components/ui/NotesForm/NotesForm';

// Frontend Code

export default function () {
  return (
    <>
      <Head>
        <title>EduNotes - Learn Anything</title>
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
