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
  const cookies = parseCookies(ctx);
  const accessToken = cookies['my-access-token'];
  const refreshToken = cookies['my-refresh-token'];

  if (!accessToken || !refreshToken) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const supabase = createServerSupabaseClient(ctx);
  await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  const user = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
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
          user: userData,
          notes: notesData,
          sessions: sessionData,
          accessToken,
        },
      },
    },
  };
};
export default function ({
  fallback,
  accessToken,
}: {
  fallback: any;
  accessToken: string;
}) {
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
        <NotesComponent accessToken={accessToken} />
      </SWRConfig>
    </>
  );
}
