import { Fragment, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  Session,
  useSession,
  useSupabaseClient,
} from '@supabase/auth-helpers-react';
import useSWR from 'swr';
import {
  TvIcon,
  DocumentMagnifyingGlassIcon,
  BookOpenIcon,
  SpeakerXMarkIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import {
  ChevronRightIcon,
  ChevronUpDownIcon,
  HomeIcon,
  NewspaperIcon,
  PlusIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import GeneratePublicLiveNotes from '../Modals/GeneratePublicLiveNotes';
import formatDateTime from '@/utils/formatDateTime';
import router from 'next/router';

interface SidebarComponentProps {
  finalImageUrl: string;
  name: string;
}

const SidebarComponent = (props: SidebarComponentProps) => {
  const { finalImageUrl, name } = props;

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    });

    router.push('/');
  };

  return (
    <div className="mt-5 flex h-0 flex-1 flex-col overflow-y-auto pt-1">
      {/* User account dropdown */}
      <Menu as="div" className="relative inline-block px-3 text-left">
        <div>
          <Menu.Button className="group w-full rounded-md bg-gray-100 px-3.5 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-100">
            <span className="flex w-full items-center justify-between">
              <span className="flex min-w-0 items-center justify-between space-x-3">
                {finalImageUrl ? (
                  <img
                    src={finalImageUrl}
                    className="flex-shrink-0 h-10 w-10 rounded-full"
                    alt={name}
                  />
                ) : (
                  <UserIcon
                    className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"
                    aria-hidden="true"
                  />
                )}
                <span className="truncate text-sm font-medium text-gray-900">
                  {name}
                </span>
              </span>
              <ChevronUpDownIcon
                className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                aria-hidden="true"
              />
            </span>
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 right-0 z-10 mx-3 mt-1 origin-top divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm',
                    )}
                  >
                    View profile
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm',
                    )}
                  >
                    Settings
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm',
                    )}
                  >
                    Notifications
                  </a>
                )}
              </Menu.Item>
            </div>
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm',
                    )}
                  >
                    Get desktop app
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm',
                    )}
                  >
                    Support
                  </a>
                )}
              </Menu.Item>
            </div>
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block px-4 py-2 text-sm',
                    )}
                  >
                    Logout
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={classNames(
                item.current
                  ? 'bg-indigo-700 text-white'
                  : 'text-white hover:bg-indigo-700 hover:text-white',
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
              )}
              aria-current={item.current ? 'page' : undefined}
            >
              <item.icon
                className={classNames(
                  item.current
                    ? 'text-white'
                    : 'text-indigo-300 group-hover:text-white',
                  'mr-3 h-6 w-6 flex-shrink-0',
                )}
                aria-hidden="true"
              />
              {item.name}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default SidebarComponent;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const navigation = [
  {
    name: 'Home',
    href: '/courses',
    icon: HomeIcon,
    current: false,
  },
  {
    name: 'Automated Grading',
    href: '/grading',
    icon: PencilSquareIcon,
    current: false,
  },
  {
    name: 'My Notes',
    href: '/my-notes',
    icon: NewspaperIcon,
    current: true,
  },
];
