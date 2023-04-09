import GradientBg from '@/components/GradientBg';
import React, { useEffect, useState } from 'react';
import SuccessAlert from 'components/ui/SuccessAlert';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import {
  useSession,
  useSupabaseClient,
  useUser,
} from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

export default function Hero() {
  const user = useUser();
  const session = useSession();
  const supabase = useSupabaseClient();
  const router = useRouter(); // Initialize useRouter
  useEffect(() => {
    if (user && session) {
      router.push('/generate'); // Navigate to the dashboard
    }
  }, [session, router, user]); // Add router as a dependency

  return (
    <section className="py-20 relative sm:py-24 bg-black">
      <div className="custom-screen relative z-10">
        {!session && (
          <>
            <div className="max-w-3xl mx-auto text-center space-y-6 text-white">
              <h1
                className="text-gray-800 text-4xl font-extrabold md:text-6xl"
                style={{ color: '#f9f9f9' }}
              >
                AI powered education.
              </h1>
              <p className="text-gray-300 max-w-xl mx-auto">
                Join our exclusive beta program and experience the future of
                learning with personalized curriculums based on your material.
              </p>
            </div>
            <div className="max-w-md mx-auto mt-4">
              <Auth
                view="magic_link"
                supabaseClient={supabase}
                theme="dark"
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#127FBF',
                        brandAccent: '#127FBF',
                      },
                      fonts: {
                        bodyFontFamily: 'Montserrat',
                        inputFontFamily: 'Montserrat',
                      },
                    },
                  },
                }}
              />
            </div>
          </>
        )}
      </div>
      <GradientBg />
    </section>
  );
}
