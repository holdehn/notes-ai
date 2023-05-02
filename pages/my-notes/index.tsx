import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Head from 'next/head';
import { SWRConfig } from 'swr';
import NotesComponent from '@/components/NotesComponent/NotesComponent';
import { useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  console.log(session);
  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const user = await supabase.auth.getUser();

  // Check if there is an active user
  if (user) {
    // Check if the user exists in the database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.data.user?.id as string);

    if (userError) {
      console.error('Error fetching user from database:', userError);
    }

    // If the user exists in the database, redirect them to the /my-notes page
    if (userData && userData.length > 0) {
      await supabase.auth.signOut();
      return {
        redirect: {
          destination: '/my-notes',
          permanent: false,
        },
      };
    }
  }

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
          user: session.user,
          notes: notesData,
          sessions: sessionData,
          initalSession: session,
        },
      },
    },
  };
};
export default function ({
  fallback,
  initalSession,
}: {
  fallback: any;
  initalSession: any;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!initalSession) {
      router.push('/');
    }
  }, [initalSession]);

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
