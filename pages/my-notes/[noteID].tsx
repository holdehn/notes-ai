import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Head from 'next/head';
import { SWRConfig } from 'swr';
import NoteDetailsComponent from '@/components/NoteDetailsComponent/NoteDetailsComponent';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);
  const noteId = ctx.query.noteID;

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

  const user_id = session?.user?.id;

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
