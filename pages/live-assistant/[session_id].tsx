import { useState, ChangeEvent, useEffect } from 'react';
import Head from 'next/head';
import DashboardLayout from '@/components/DashboardLayout';
import TextInput from '@/components/ui/TextInput/TextInput';
import Option from '@/components/ui/Option/Option';
import LiveAssistantComponent from '@/components/LiveAssistantComponent/LiveAssistantComponent';

// Frontend Code

export default function () {
  return (
    <>
      <Head>
        <title>EduNotes - Session Details</title>
      </Head>

      <LiveAssistantComponent />
    </>
  );
}
