import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Head from 'next/head';
import { SWRConfig } from 'swr';
import NotesComponent from '@/components/NotesComponent/NotesComponent';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

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

  if (accessToken && refreshToken) {
    // Set the cookies
    const maxAge = 100 * 365 * 24 * 60 * 60; // 100 years, never expires
    ctx.res.setHeader('Set-Cookie', [
      `my-access-token=${accessToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure; HttpOnly`,
      `my-refresh-token=${refreshToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure; HttpOnly`,
    ]);
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
        },
        accessToken,
        refreshToken,
      },
    },
  };
};
export default function ({
  fallback,
}: {
  fallback: any;
  accessToken: string;
  refreshToken: string;
}) {
  const router = useRouter();

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
