import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Head from 'next/head';
import { SWRConfig } from 'swr';
import NoteDetailsComponent from '@/components/NoteDetailsComponent/NoteDetailsComponent';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const cookies = parseCookies(ctx);
  const accessToken = cookies['my-access-token'];
  const refreshToken = cookies['my-refresh-token'];
  const noteId = ctx.query.noteID;

  if (!accessToken || !refreshToken || !noteId) {
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

  const user_id = user.data.user?.id;

  const { data: noteData, error: noteError } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', user_id)
    .single();

  if (noteError) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      fallback: {
        [`/api/get-note?noteId=${noteId}&userId=${user_id}`]: noteData,
      },
    },
  };
};

export default function ({ fallback }: { fallback: any }) {
  return (
    <>
      <Head>
        <title>NotesAI - Generated Notes</title>
        <meta name="description" content="Generate notes from your lectures" />
      </Head>
      <SWRConfig value={{ fallback }}>
        <NoteDetailsComponent />
      </SWRConfig>
    </>
  );
}
