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

  const user = await supabase.auth.getUser();

  // Check if there is an active user
  if (user && user.data.user) {
    const userId = user.data.user.id;
    // Fetch notes-page-data using the supabaseClient
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId);

    if (userError) {
      return {
        notFound: true,
      };
    }

    const { data: notesData, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Return the notes-page-data in the props
    return {
      props: {
        fallback: {
          [`/api/notes-page-data?userID=${userId}`]: {
            user: user,
            notes: notesData,
            initalSession: session,
          },
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

export default function ({
  fallback,
  userData,
}: {
  fallback: ProvidedProps;
  userData: any;
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
        <NotesComponent />
      </SWRConfig>
    </>
  );
}
