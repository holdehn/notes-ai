import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Auth, Button } from '@supabase/ui';
import { supabaseClient } from 'utils/supabase-client';

const SigninCover = () => {
  const router = useRouter();
  const { user } = Auth.useUser();

  useEffect(() => {
    if (user) {
      router.push(`/${user.user_metadata.account_type}-dashboard`);
    }
  }, [user, router]);

  // async function signInWithGoogle() {
  //   await supabaseClient.auth.signIn({ provider: 'google' });
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-400 to-pink-500">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <div className="flex flex-col items-center mb-6">
          <img className="w-48 h-12" src="/images/logo.png" alt="MusikLink" />
          <h1 className="text-2xl font-semibold text-black mt-6">
            Welcome back!
          </h1>
          <h2 className="text-xl font-medium text-black mt-1">
            Log in to your account
          </h2>
        </div>
        <div className="w-full">
          <Auth
            supabaseClient={supabaseClient}
            providers={['google']}
            socialLayout="horizontal"
            socialButtonSize="xlarge"
          />
          <Button
            // onClick={signInWithGoogle}
            className="mt-4"
            block
            // icon={<IconGoogle />}
          >
            Continue with Google
          </Button>
          <div className="mt-6 text-center">
            <p className="text-sm font-semibold text-black">
              Don't have an account?{' '}
              <a
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={() => router.push('/signup')}
              >
                Sign up here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninCover;
