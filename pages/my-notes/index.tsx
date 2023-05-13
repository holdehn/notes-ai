import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Head from 'next/head';
import { SWRConfig } from 'swr';
import NotesComponent from '@/components/NotesComponent/NotesComponent';
import { useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

export interface ProvidedProps {
  fallback: Record<string, unknown>;
}

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ProvidedProps>> => {
  const supabase = createServerSupabaseClient(ctx);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Check if there is an active user
  if (session && session.user?.id) {
    const userId = session.user?.id;
    const { data: notesData, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Return the notes-page-data in the props
    return {
      props: {
        fallback: {
          [`/api/notes-page-data?userID=${userId}`]: notesData,
        },
      },
    };
  }

  // If there is no active user, redirect to the homepage
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
};

export default function ({ fallback }: { fallback: ProvidedProps }) {
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
      <SWRConfig value={{ fallback }}>
        <NotesComponent />
      </SWRConfig>
    </>
  );
}
