import Hero from '@/components/HeroSection/HeroSection';
import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';
import Features from '@/components/FeatureSection/FeatureSection';
import PricingSection from '@/components/PricingSection/PricingSection';
import { Element } from 'react-scroll';

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
