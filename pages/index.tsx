import Hero from '@/components/HeroSection/HeroSection';
import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';
import Features from '@/components/FeatureSection/FeatureSection';
import PricingSection from '@/components/PricingSection/PricingSection';
import { Element } from 'react-scroll';
import { useSession } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { accessToken, refreshToken } = ctx.query;

  if (accessToken && refreshToken) {
    // Set the cookies
    const maxAge = 100 * 365 * 24 * 60 * 60; // 100 years, never expires
    ctx.res.setHeader('Set-Cookie', [
      `my-access-token=${accessToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure; HttpOnly`,
      `my-refresh-token=${refreshToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure; HttpOnly`,
    ]);

    return {
      redirect: {
        destination: '/my-notes',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default function Home() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session) {
      router.replace('/my-notes');
    }
  }, [session, router]);
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
