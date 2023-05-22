import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Head from 'next/head';
import { SWRConfig } from 'swr';
import NotesComponent from '@/components/NotesComponent/NotesComponent';
import { useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import HomeComponent from '@/components/HomeComponent/HomeComponent';

export default function () {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (!session) {
      router.push('/');
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>NotesAI - My Notes</title>
        <meta name="description" content="Generate notes from your lectures" />
      </Head>
      <HomeComponent />
    </>
  );
}
