import Features from '@/components/ui/Features';
import Footer from '@/components/ui/Footer';
import Hero from '@/components/ui/Hero';
import Navbar from '@/components/ui/Navbar';
import Head from 'next/head';

export default function Home() {
  return (
    <main>
      <Head>
        <title>EduLink - AI powered education</title>
        <meta
          name="description"
          content="Organize and manage different subjects while getting personalized AI tutoring."
        />
      </Head>
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
