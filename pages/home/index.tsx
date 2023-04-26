import { useState, ChangeEvent, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import TextInput from '@/components/ui/TextInput/TextInput';
import Option from '@/components/ui/Option/Option';
import Dashboard from '@/components/Dashboard/Dashboard';

// Frontend Code

export default function () {
  return (
    <>
      <Head>
        <title>EduNotes - Learn Anything</title>
        <meta name="description" content="Generate notes from your lectures" />
      </Head>
      <Dashboard />
    </>
  );
}
