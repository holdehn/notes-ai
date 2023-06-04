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

export default function Home() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session) {
      router.push('/courses');
    }
  }, [session]);

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
        <HeroSection />
      </Element>
    </main>
  );
}
