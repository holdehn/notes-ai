import { Fragment, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  Bars3CenterLeftIcon,
  XMarkIcon,
  GlobeAltIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import {
  ChevronRightIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PlusIcon,
  HomeIcon,
} from '@heroicons/react/20/solid';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import useSWR from 'swr';
import { Session, useUser } from '@supabase/auth-helpers-react';
import GenerateNotesModal from '../Modals/GenerateNotesModal';
import { useSession } from '@supabase/auth-helpers-react';
import router from 'next/router';
import formatDateTime from '@/utils/formatDateTime';
import GenerateYoutubeNotesModal from '../Modals/GenerateYoutubeNotesModal';

const NotesComponent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openNotesModal, setOpenNotesModal] = useState(false);
  const [openYoutubeNoteModal, setOpenYoutubeNoteModal] = useState(false);
  const [openLiveModal, setOpenLiveModal] = useState(false);
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
      <div className="min-h-full">
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
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75 " />
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
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col pb-4 pt-5">
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
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-600 bg-gradient-to-r from-indigo-950 to-indigo-900 lg:pb-4 lg:pt-5">
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
            {/* Sidebar Search */}
            <div className="mt-5 px-3">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                  aria-hidden="true"
                >
                  <MagnifyingGlassIcon
                    className="h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="block w-full rounded-md border-0 py-1.5 pl-9 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Search"
                />
              </div>
            </div>
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
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 lg:hidden">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3CenterLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                {/* Profile dropdown */}
                <Menu as="div" className="relative inline-block px-3 text-left">
                  <div>
                    <Menu.Button className="group w-full rounded-md bg-indigo-800 px-3.5 py-2 text-left text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-indigo-800">
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

                          <span className="flex min-w-0 flex-1 flex-col">
                            <span className="truncate text-sm font-medium text-white">
                              {name}
                            </span>
                          </span>
                        </span>
                        <ChevronUpDownIcon
                          className="h-5 w-5 flex-shrink-0 text-white group-hover:text-indigo-200"
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
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-gray-200 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
          </div>
          <main className="flex-1 p-6">
            {/* Page title & actions */}
            <div className="px-4 py-8 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 bg-gray-200">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold leading-6 text-black sm:truncate">
                  NotesAI
                </h1>
                <p className="mt-1 text-sm text-gray-900">
                  Generate high quality lecture notes instantly!
                </p>
              </div>
              <div className="mt-4 flex sm:mt-0 space-x-3">
                <button
                  type="button"
                  onClick={() => setOpenNotesModal(true)}
                  className="inline-flex items-center px-4 py-2 text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Generate
                </button>
                <GenerateNotesModal
                  open={openNotesModal}
                  setOpen={setOpenNotesModal}
                />

                <button
                  onClick={() => setOpenYoutubeNoteModal(true)}
                  className="inline-flex items-center px-4 py-2 text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Youtube
                </button>
                <GenerateYoutubeNotesModal
                  open={openYoutubeNoteModal}
                  setOpen={setOpenYoutubeNoteModal}
                />

                {/* <button
                  onClick={() => setOpenLiveModal(true)}
                  className="inline-flex items-center px-4 py-2 text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Live
                </button> */}
              </div>
            </div>

            {/* Projects list (only on smallest breakpoint) */}
            <div className="sm:hidden">
              <ul role="list">
                {notes?.map((note: any, index: number) => (
                  <li key={note.index}>
                    <a
                      href={`/my-notes/${note.note_id}`}
                      className={`group flex items-center justify-between px-4 py-4 sm:px-6 ${
                        index % 2 === 0 ? 'bg-purple-100' : 'bg-indigo-100'
                      } hover:bg-purple-400`}
                    >
                      <span className="flex items-center space-x-3 truncate">
                        <span
                          className={classNames(
                            note.bgColorClass,
                            'h-2.5 w-2.5 flex-shrink-0 rounded-full',
                          )}
                          aria-hidden="true"
                        />
                        <span className="truncate text-sm font-medium leading-6 text-black">
                          {note.title}{' '}
                        </span>
                      </span>
                      <ChevronRightIcon
                        className="ml-4 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="fixed bottom-4 right-4 z-50 sm:hidden">
              <button
                type="button"
                onClick={() => setOpenNotesModal(true)}
                className="relative inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <span className="sr-only">Generate Notes</span>
                <PlusIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            {/* Projects table (small breakpoint and up) */}

            <div className="hidden sm:block">
              <div className="hidden sm:block">
                <div className="inline-block min-w-full border-b align-middle">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-t border-gray-600 bg-black">
                        <th
                          className="border-b border-gray-600 bg-black px-6 py-3 text-left text-sm font-semibold text-gray-200"
                          scope="col"
                        >
                          <span className="lg:pl-2">My Notes</span>
                        </th>

                        <th
                          className="hidden border-b border-gray-600 bg-black px-6 py-3 text-right text-sm font-semibold text-gray-200 md:table-cell"
                          scope="col"
                        >
                          Last updated
                        </th>
                        <th
                          className="border-b border-gray-600 bg-black py-3 pr-6 text-right text-sm font-semibold text-gray-200"
                          scope="col"
                        />
                      </tr>
                    </thead>

                    <tbody
                      className={`divide-y divide-gray-600 ${
                        notes?.length > 0 ? 'bg-purple-100' : ''
                      }`}
                    >
                      {notes?.map((note: any, index: number) => (
                        <tr
                          key={note.index}
                          className={`group cursor-pointer hover:bg-purple-400 ${
                            index % 2 === 0 ? 'bg-purple-100' : 'bg-indigo-100'
                          }`}
                          onClick={() =>
                            router.push(`/my-notes/${note.note_id}`)
                          }
                        >
                          <td className="w-full max-w-0 whitespace-nowrap px-6 py-3 text-sm font-medium text-black">
                            <div className="flex items-center space-x-3 lg:pl-2">
                              <div
                                className={classNames(
                                  note.bgColorClass,
                                  'h-2.5 w-2.5 flex-shrink-0 rounded-full ',
                                )}
                                aria-hidden="true"
                              />
                              <a
                                href={`/my-notes/${note.note_id}`}
                                className="truncate "
                              >
                                <span>{note.title}</span>
                              </a>
                            </div>
                          </td>

                          <td className="hidden whitespace-nowrap px-6 py-3 text-right text-sm text-black md:table-cell">
                            {note.created_at}
                          </td>
                          <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-medium">
                            <a
                              href={`/my-notes/${note.note_id}`}
                              className="text-indigo-600 group-hover:text-indigo-800"
                            >
                              View
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {notes?.length === 0 && (
                    <div className="flex justify-center items-center h-36 bg-indigo-950">
                      <button onClick={() => setOpenNotesModal(true)}>
                        <div className="text-white font-medium text-xl">
                          Create a note to get started!
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default NotesComponent;

const navigation = [
  { name: 'Home', href: '/', icon: HomeIcon, current: false },
  {
    name: 'My Notes',
    href: '/created-notes',
    icon: NewspaperIcon,
    current: true,
  },
  {
    name: 'Browse',
    href: '/',
    icon: GlobeAltIcon,
    current: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
