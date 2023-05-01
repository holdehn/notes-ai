import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { parseCookies } from 'nookies';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Head from 'next/head';
import { SWRConfig } from 'swr';
import NotesComponent from '@/components/NotesComponent/NotesComponent';
import { useEffect } from 'react';

export const getServerSideProps = async (
  ctx:
    | GetServerSidePropsContext
    | { req: NextApiRequest; res: NextApiResponse },
) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx);
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };

  const user = await supabase.auth.getUser();

  // Fetch notes-page-data using the supabaseClient
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.data.user?.id as string);

  if (userError) {
    return {
      notFound: true,
    };
  }

  const { data: notesData, error: notesError } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.data.user?.id as string)
    .order('created_at', { ascending: false });

  const { data: sessionData, error: sessionsError } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('user_id', user.data.user?.id as string);

  // Return the notes-page-data in the props
  return {
    props: {
      fallback: {
        [`/api/notes-page-data?userID=${user.data.user?.id}`]: {
          user: userData,
          notes: notesData,
          sessions: sessionData,
        },
      },
    },
  };
};
export default function ({ fallback }: { fallback: any }) {
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
