import Features from '@/components/ui/Features';
import Footer from '@/components/ui/Footer';
import Hero from '@/components/ui/Hero';
import Navbar from '@/components/ui/Navbar';
import { useSession } from '@supabase/auth-helpers-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session) {
      router.push('/my-notes');
    }
  }, [session]);
  return (
    <main>
      <Head>
        <title>NotesAI- Work smarter, not harder</title>
        <meta
          name="description"
          content="Organize and manage different subjects while getting personalized AI tutoring."
        />
      </Head>
      {/* <Navbar /> */}
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
