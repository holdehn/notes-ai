import HeroSection from '@/components/HeroSection/HeroSection';
import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';
import Features from '@/components/FeatureSection/FeatureSection';
import PricingSection from '@/components/PricingSection/PricingSection';
import { Element } from 'react-scroll';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import PublicNotesTable from '@/components/ui/PublicNotesTable';
import { useEffect, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import formatDateTime from '@/utils/formatDateTime';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient(ctx);

  const cookies = parseCookies(ctx);
  const accessToken = cookies['my-access-token'];
  const refreshToken = cookies['my-refresh-token'];

  if (accessToken && refreshToken) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if there is an active session
    if (session) {
      const user = await supabase.auth.getUser();

      // Check if there is an active user
      if (user) {
        return {
          redirect: {
            destination: '/my-notes',
            permanent: false,
          },
        };
      }
    }
  }
  const { data: noteData, error: noteError } = await supabase
    .from('public_notes')
    .select('id, title, created_at, topic, color_theme')
    .order('created_at', { ascending: false });

  if (noteError) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      notes: noteData,
    }, // Return empty props
  };
};
export default function Home({ notes }: { notes: any }) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session) {
      router.push('/my-notes');
    }
  }, [session]);

  const noteData = notes?.map(
    (
      note: {
        color_theme: any;
        created_at: any;
        id: any;
        title: any[];
        topic: any;
      },
      i: number,
    ) => ({
      index: i + 1,
      note_id: note.id,
      title: note.title,
      created_at: formatDateTime(note.created_at),
      bgColorClass: note.color_theme,
      topic: note.topic,
    }),
  );

  return (
    <main>
      <Head>
        <title>NotesAI- Summarize Anything</title>
        <meta
          name="description"
          content="Organize and manage different subjects while getting personalized AI tutoring."
        />
      </Head>
      <Element name="home">
        <HeroSection noteData={noteData} />
      </Element>
    </main>
  );
}
