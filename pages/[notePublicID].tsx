import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import Head from 'next/head';
import { SWRConfig } from 'swr';
import NoteDetailsPublic from '@/components/NoteDetailsPublic/NoteDetailsPublic';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);
  const noteId = ctx.query.notePublicID;

  const { data: noteData, error: noteError } = await supabase
    .from('public_notes')
    .select('*')
    .eq('id', noteId)
    .single();

  if (noteError) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      fallback: {
        [`/api/get-public-note?noteId=${noteId}`]: noteData,
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
        <NoteDetailsPublic />
      </SWRConfig>
    </>
  );
}
