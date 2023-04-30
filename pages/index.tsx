import Hero from '@/components/HeroSection/HeroSection';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Features from '@/components/FeatureSection/FeatureSection';
import PricingSection from '@/components/PricingSection/PricingSection';
import { Element } from 'react-scroll';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  // Create authenticated Supabase Client
  const supabase = createServerSupabaseClient(ctx);
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    return {
      redirect: {
        destination: '/my-notes',
        permanent: false,
      },
    };
  }

  return {
    props: {}, // Return empty props
  };
};
export default function Home() {
  return (
    <main>
      <Head>
        <title>NotesAI- Work smarter, not harder</title>
        <meta
          name="description"
          content="Organize and manage different subjects while getting personalized AI tutoring."
        />
      </Head>
      <Element name="home">
        <Hero />
      </Element>
      <Element name="features">
        <Features />
      </Element>
      <Element name="pricing">
        <PricingSection />
      </Element>
    </main>
  );
}
