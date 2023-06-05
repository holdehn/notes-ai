import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Head from 'next/head';
import { SWRConfig } from 'swr';

import Home from '@/components/Home/Home';

export interface ProvidedProps {
  fallback: Record<string, unknown>;
}

export const getServerSideProps = async (
  ctx: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<ProvidedProps>> => {
  const supabase = createServerSupabaseClient(ctx);
  const courseID = ctx.params?.courseID;

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
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .match({ user_id: userId, courseID: ctx.params?.courseID });

    // Return the notes-page-data in the props
    return {
      props: {
        fallback: {
          [`/api/get-course?userID=${userId}&courseID=${courseID}`]: courseData,
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
  return (
    <>
      <Head>
        <title>AutoMark - Automated Grading</title>
        <meta name="description" content="Generate notes from your lectures" />
      </Head>
      <SWRConfig value={{ fallback }}>
        <Home />
      </SWRConfig>
    </>
  );
}
