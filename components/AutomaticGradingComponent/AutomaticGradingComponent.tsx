import { Fragment, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  Session,
  useSession,
  useSupabaseClient,
} from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import useSWR from 'swr';
import {
  TvIcon,
  DocumentMagnifyingGlassIcon,
  BookOpenIcon,
  SpeakerXMarkIcon,
  GlobeAltIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { getURL } from '@/pages/api/helpers';
import {
  ChevronUpDownIcon,
  HomeIcon,
  NewspaperIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import GeneratePublicLiveNotes from '../Modals/GeneratePublicLiveNotes';
import formatDateTime from '@/utils/formatDateTime';
import router from 'next/router';
import GenerateYoutubeNotesModal from '../Modals/GenerateYoutubeNotesModal';
import GenerateNotesModal from '../Modals/GenerateNotesModal';

export default function HomeComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openModal, setOpenModal] = useState<string | null>(null);

  const supabase = useSupabaseClient();

  const rootUrl = getURL();

  const handleCardClick = (featureName: any) => {
    switch (featureName) {
      case 'Create Youtube Notes':
        setOpenModal('Youtube');
        break;
      case 'Create PDF Notes':
      case 'Audio Video Notes':
        setOpenModal('AudioPDF');
        break;
      // Add more cases as needed
      case 'Live Notes':
        setOpenModal('LiveNotes');
        break;
      default:
        setOpenModal(null);
    }
  };

  const session: Session | null = useSession();
  const userID = session?.user?.id;

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data, error } = useSWR(
    userID ? `/api/notes-page-data?userID=${userID}` : null,
    fetcher,
  );

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    });

    if (error) return alert(error.message);

    router.push('/');
  };
  const notes = data?.notes?.map(
    (
      note: {
        color_theme: any;
        created_at: any;
        id: any;
        title: any[];
        topic: any;
      },
      i: number,
    ) => ({
      index: i + 1,
      note_id: note.id,
      title: note.title,
      created_at: formatDateTime(note.created_at),
      bgColorClass: note.color_theme,
      topic: note.topic,
    }),
  );

  const name = session?.user?.user_metadata?.full_name;
  const avatar_url = session?.user?.user_metadata?.avatar_url;

  const proxyUrl = '/api/proxy?imageUrl=';

  const finalImageUrl = proxyUrl + encodeURIComponent(avatar_url);

  return (
    <>
      <div className="min-h-screen">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pb-4 pt-5">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute right-0 top-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* <div className="flex flex-shrink-0 items-center px-4">
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=purple&shade=500"
                      alt="NotesAI Logo"
                    />
                  </div> */}
                  <div className="mt-5 h-0 flex-1 overflow-y-auto">
                    <nav className="px-2">
                      <div className="space-y-1">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                              'group flex items-center rounded-md px-2 py-2 text-base font-medium leading-5',
                            )}
                            aria-current={item.current ? 'page' : undefined}
                          >
                            <item.icon
                              className={classNames(
                                item.current
                                  ? 'text-gray-500'
                                  : 'text-gray-400 group-hover:text-gray-500',
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
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-400 bg-gradient-to-r from-indigo-950 to-indigo-900 lg:pb-4 lg:pt-5">
          {/* <div className="flex flex-shrink-0 items-center px-6">
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=purple&shade=500"
                alt="NotesAI"
              />
            </div> */}
          {/* Sidebar component, swap this element with another sidebar if you like */}
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
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
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
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
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
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
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
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
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
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
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
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
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
        </div>
        {/* Main column */}
        <div className="flex flex-col lg:pl-64">
          {/* Search header */}
          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700',
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
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700',
                              'block px-4 py-2 text-sm',
                            )}
                          >
                            Settings
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
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700',
                              'block px-4 py-2 text-sm',
                            )}
                          >
                            Logout
                          </a>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>

          <GenerateYoutubeNotesModal
            open={openModal === 'Youtube'}
            setOpen={() => setOpenModal(null)}
          />
          <GenerateNotesModal
            open={openModal === 'AudioPDF'}
            setOpen={() => setOpenModal(null)}
          />
          <GeneratePublicLiveNotes
            open={openModal === 'LiveNotes'}
            setOpen={() => setOpenModal(null)}
            userID={userID}
          />
          {/* <GeneratePublicLectureNotes
            open={openModal === 'LectureNotes'}
            setOpen={() => setOpenModal(null)}
          /> */}

          <main>
            <div className="bg-gradient-to-r from-[#1c0232] via-[#291957] to-[#480f50] relative min-h-screen">
              <div className="p-12 sm:pb-32">
                <div className=" max-w-full">
                  <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="mt-3 text-3xl font-extrabold leading-9 text-white">
                      Summarize Anything
                    </h2>
                    <p className="mt-4 text-lg leading-7 text-gray-300">
                      Summary.io uses AI to transform complex content into
                      easily digestible notes.
                    </p>
                  </div>

                  <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-12">
                    {features.map((feature, index) => {
                      const gradientColors = [
                        'from-[#ff9a9e] to-[#fad0c4]',
                        'from-[#a1c4fd] to-[#c2e9fb]',
                        'from-[#d4fc79] to-[#96e6a1]',
                        'from-[#84fab0] to-[#8fd3f4]',
                        'from-[#FDC830] to-[#F37335]',
                        'from-[#C33764] to-[#1D2671]',
                        'from-[#FF416C] to-[#FF4B2B]',
                        'from-[#56CCF2] to-[#2F80ED]',
                      ];

                      const gradientColor =
                        gradientColors[index % gradientColors.length];

                      return (
                        <div
                          key={feature.name}
                          className={`space-y-4 p-8 rounded-lg bg-gradient-to-tr ${gradientColor} transform transition-all duration-200 ease-in-out hover:scale-105 cursor-pointer`}
                          onClick={() => handleCardClick(feature.name)}
                        >
                          <div className="mx-auto h-12 w-12 p-2 rounded-full bg-gradient-to-tr from-[#FFD6A5] to-[#FFC371]">
                            <feature.icon className="h-full w-full text-gray-800" />
                          </div>
                          <h3 className="text-lg font-semibold leading-7 text-black">
                            {feature.name}
                          </h3>
                          <p className="text-base leading-6 text-white0">
                            {feature.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

const features = [
  {
    name: 'Create Youtube Notes',
    description: 'Summarize Youtube videos with ease.',
    icon: TvIcon,
  },
  {
    name: 'Create PDF Notes',
    description: 'Summarize lengthy PDFs into concise notes.',
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    name: 'Audio Video Notes',
    description: 'Transcribe and summarize audio recordings.',
    icon: SpeakerXMarkIcon,
  },
  {
    name: 'Live Notes',
    description: 'Record audio and recieve high quality notes.',
    icon: BookOpenIcon,
  },
  // {
  //   name: 'Lecture Notes',
  //   description: 'Summarize your lecture notes.',
  //   icon: DocumentTextIcon,
  // },
];

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon, current: true },
  {
    name: 'My Notes',
    href: '/created-notes',
    icon: NewspaperIcon,
    current: false,
  },
  {
    name: 'Automated Grading',
    href: '/automatic-grading',
    icon: PencilSquareIcon,
    current: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
