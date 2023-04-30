import '@/styles/base.css';
import type { AppProps } from 'next/app';
import { Montserrat } from 'next/font/google';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import {
  SessionContextProvider,
  useSession,
} from '@supabase/auth-helpers-react';
import { useState } from 'react';

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
});

function MyApp({ Component, pageProps }: AppProps) {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  const isSecure = process.env.NODE_ENV === 'production';

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
      // delete cookies on sign out
      const expires = new Date(0).toUTCString();
      document.cookie = `my-access-token=; path=/; expires=${expires}; SameSite=${
        isSecure ? 'Secure' : 'Lax'
      }; secure`;
      document.cookie = `my-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
    } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      const maxAge = 100 * 365 * 24 * 60 * 60; // 100 years, never expires
      document.cookie = `my-access-token=${
        session?.access_token
      }; path=/; max-age=${maxAge}; SameSite=${
        isSecure ? 'Secure' : 'Lax'
      }; secure`;
      document.cookie = `my-refresh-token=${
        session?.refresh_token
      }; path=/; max-age=${maxAge}; SameSite=${
        isSecure ? 'Secure' : 'Lax'
      }; secure`;
    }
  });
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <main className={montserrat.variable}>
        <Component {...pageProps} />
      </main>
    </SessionContextProvider>
  );
}

export default MyApp;
