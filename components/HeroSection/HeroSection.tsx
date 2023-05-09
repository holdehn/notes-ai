import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Link } from 'react-scroll';

import { getURL } from '@/pages/api/helpers';
import GeneratePublicNotesModal from '../GeneratePublicNotesModal';
import PublicNotesTable from '../ui/PublicNotesTable';

const navigation = [
  { name: 'Home', href: 'home' },
  { name: 'Features', href: 'features' },
  { name: 'Pricing', href: 'pricing' },
  { name: 'Blog', href: 'blog' },
];

export default function HeroSection({ noteData }: { noteData: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = useSupabaseClient();
  const [openPublicNoteModal, setOpenPublicNoteModal] = useState(false);

  const rootUrl = getURL();

  return (
    <div className="bg-gradient-to-r from-[#1c0232] via-[#000592] to-[#94295f]">
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
      </header>

      <div className=" h-3/4 pt-16 relative isolate px-6 lg:px-8 flex flex-col items-center">
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
        <div className="mx-auto max-w-2xl pt-12 p-12 xs:pt-12 sm:pt-24 lg:pt-16 my-auto">
          {' '}
          {/* Change padding values */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-4xl">
              Never worry about taking notes again.{' '}
            </h1>
            <div className="relative rounded-full px-3 py-6 text-md font-medium leading-6 text-indigo-100">
              Generate high quality notes in an instant using NotesAI, powered
              by GPT. <br />
              <a
                href="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 underline hover:text-indigo-200 transition-colors duration-200"
              >
                Youtube Demo
              </a>
            </div>
            <div className="max-w-xs mx-auto mt-4">
              <Auth
                view="sign_in"
                magicLink={false}
                dark={false}
                showLinks={false}
                redirectTo={`${rootUrl}/my-notes/`}
                onlyThirdPartyProviders={true}
                providers={['google', 'discord']}
                supabaseClient={supabase}
                socialLayout="horizontal"
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
            <div className="flex justify-center mt-4 mb-4 p-4">
              <button
                onClick={() => setOpenPublicNoteModal(true)}
                className="relative bg-purple-600 hover:bg-purple-800 min-w-[150px] rounded-full px-3 py-2 text-sm leading-6 text-white font-semibold cursor-pointer"
              >
                <span className="absolutes inset-0" aria-hidden="true" />
                Click here to try yourself!
                <span aria-hidden="true" />
              </button>
            </div>

            <GeneratePublicNotesModal
              open={openPublicNoteModal}
              setOpen={setOpenPublicNoteModal}
            />
          </div>
        </div>

        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#48011f] to-[#2f26af] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
      {/* <div className="relative rounded-full py-1 text-sm  text-gray-400">
        <PublicNotesTable notes={noteData} />
        <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-400">
          Demo by holden.{' '}
          <a
            href="https://twitter.com/holdehnj"
            target="_blank"
            className="font-semibold text-indigo-400"
          >
            <span className="absolute inset-0" aria-hidden="true" />
            Twitter <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div> */}
    </div>
  );
}
