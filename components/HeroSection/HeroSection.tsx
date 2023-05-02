import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Link } from 'react-scroll';
import { useRouter } from 'next/router';
import { getURL } from '@/pages/api/helpers';

const navigation = [
  { name: 'Home', href: 'home' },
  { name: 'Features', href: 'features' },
  { name: 'Pricing', href: 'pricing' },
  { name: 'Blog', href: 'blog' },
];

export default function HeroSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const supabase = useSupabaseClient();

  return (
    <div className="bg-gradient-to-r from-[#000000] via-[#000592] to-[#94295f] opacity-90">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav
          className="flex items-center justify-between p-6 lg:px-8 bg-gradient-to-r from-[#000000] via-[#020320] to-[#210a15] opacity-90"
          aria-label="Global"
        >
          <div className="flex lg:flex-1"></div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                smooth={true}
                className="text-sm font-semibold leading-6 text-white hover:text-gray-50 cursor-pointer"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end"></div>
        </nav>
        <Dialog
          as="div"
          className="lg:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 z-50" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto  px-6 py-6 sm:ring-1 sm:ring-gray-900/10">
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a
                    href="#"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  >
                    Log in
                  </a>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>

      <div className="relative isolate px-6 lg:px-8 h-screen flex flex-col items-center">
        <div
          className="absolute inset-x-0 -top-32 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-64"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="mx-auto max-w-2xl pt-8 xs:pt-12 sm:pt-24 lg:pt-16 my-auto">
          {' '}
          {/* Change padding values */}
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-5xl">
              Taking lecture notes is so April 2023.{' '}
            </h1>
            <div className="hidden sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-6 text-sm leading-6 text-indigo-200 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                Upload lecture recordings or PDF's and recieve premium high
                quality notes instantly{' '}
                <a href="#" className="font-semibold text-indigo-500">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Learn more <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
            <div className="max-w-md mx-auto mt-4">
              <Auth
                view="magic_link"
                magicLink={true}
                dark={false}
                showLinks={false}
                supabaseClient={supabase}
                theme="dark"
                appearance={{
                  theme: ThemeSupa,
                  style: {
                    message: {
                      color: '#ffffff',
                      fontWeight: 650,
                    },
                  },
                  variables: {
                    default: {
                      colors: {
                        inputLabelText: '#ffffff',
                        brand: '#7c3aed',
                        messageText: 'white',
                        brandAccent: '#c084fc',
                        anchorTextHoverColor: 'ffffff',
                        anchorTextColor: '#ffffff',
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
          </div>
        </div>

        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
