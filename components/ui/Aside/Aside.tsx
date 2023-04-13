import { IconBar, IconXMark } from '@/components/icons';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import NavLink from '../NavLink';

export default () => {
  const [isOpen, setOpen] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    router.events.on('routeChangeStart', () => setOpen(false));
  }, []);

  return (
    <div className="flex-none fixed z-50 top-16 w-full lg:relative lg:max-w-[16rem] lg:top-1">
      <div className="py-4 px-4 bg-black border-y md:px-8 lg:hidden">
        <button
          className="flex gap-x-2 items-center text-white"
          onClick={() => setOpen(!isOpen)}
        >
          {isOpen ? <IconXMark className="w-5 h-5" /> : <IconBar />}
          Menu
        </button>
      </div>
      <aside className="relative w-full lg:mt-16 lg:pt-1">
        <div
          className={`fixed w-full h-full bg-black lg:block lg:max-w-[16rem] lg:top-auto ${
            isOpen ? '' : 'hidden'
          }`}
        >
          <ul className="h-full overflow-y-auto space-y-px pb-32 text-white text-[.9rem] pt-6 lg:pb-28">
            {/* Add profile picture */}
            <li className="py-8 text-center">
              <img
                src="/React.png"
                alt="Profile Pic"
                className="w-32 h-32 mx-auto rounded-full border-2 border-gray-700"
              />
            </li>

            <li className="border-b border-gray-800">
              <NavLink
                href="/home"
                className="block rounded-md hover:bg-gray-700"
                active="bg-gray-700 text-white font-medium"
              >
                RoboWriter
              </NavLink>
            </li>
            <li className="border-b border-gray-800">
              <NavLink
                href="/notes-ai"
                className="block rounded-md hover:bg-gray-700"
                active="bg-gray-700 text-white font-medium"
              >
                NotesAI
              </NavLink>
            </li>
            <li className="border-b border-gray-800">
              <NavLink
                href="/saved-essays"
                className="block rounded-md hover:bg-gray-700"
                active="bg-gray-700 text-white font-medium"
              >
                AskPDF
              </NavLink>
            </li>
            <li className="border-b border-gray-800">
              <NavLink
                href="/saved-essays"
                className="block rounded-md hover:bg-gray-700"
                active="bg-gray-700 text-white font-medium"
              >
                Quiz Generator
              </NavLink>
            </li>
            <li className="border-b border-gray-800">
              <NavLink
                href="/saved-essays"
                className="block rounded-md hover:bg-gray-700"
                active="bg-gray-700 text-white font-medium"
              >
                Settings
              </NavLink>
            </li>
            {/* Add more menu items as required */}
          </ul>
        </div>
      </aside>
    </div>
  );
};
