import Features from '@/components/ui/Features';
import Footer from '@/components/ui/Footer';
import Hero from '@/components/ui/Hero';
import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const cookies = parseCookies(ctx);
  const accessToken = cookies['my-access-token'];
  const refreshToken = cookies['my-refresh-token'];

  if (accessToken && refreshToken) {
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
      {/* <Navbar /> */}
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
