import {
  Fragment,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactFragment,
  ReactPortal,
  use,
  useEffect,
  useState,
} from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  Bars3CenterLeftIcon,
  Bars4Icon,
  ClockIcon,
  HomeIcon,
  XMarkIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import {
  ChevronRightIcon,
  ChevronUpDownIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import useSWR from 'swr';
import { createSupabaseClient } from 'supabase-client';
import { Session, useUser } from '@supabase/auth-helpers-react';
import AgentModal from '../Modals/AgentModal';
import CreateAgentModal from '../Modals/CreateAgentModal/CreateAgentModal';
import GenerateNotesModal from '../Modals/GenerateNotesModal/GenerateNotesModal';
import { useSession } from '@supabase/auth-helpers-react';
import { format } from 'date-fns';

function formatDateTime(dateString: string | number | Date) {
  const date = new Date(dateString);
  return format(date, 'PPP p');
}

const navigation = [
  { name: 'Home', href: '/home', icon: HomeIcon, current: false },
  { name: 'NotesAI', href: '/my-notes', icon: NewspaperIcon, current: true },
  {
    name: 'Live Assistant',
    href: '/live-assistant',
    icon: SmartToyIcon,
    current: false,
  },
  {
    name: 'Research',
    href: '/research',
    icon: MagnifyingGlassIcon,
    current: false,
  },

  {
    name: 'Settings',
    href: '/settings',
    icon: Bars3CenterLeftIcon,
    current: false,
  },
];
const teams = [
  { name: 'Engineering', href: '#', bgColorClass: 'bg-indigo-500' },
  { name: 'Human Resources', href: '#', bgColorClass: 'bg-green-500' },
  { name: 'Customer Success', href: '#', bgColorClass: 'bg-yellow-500' },
];
const projects = [
  {
    id: 1,
    title: 'Lecture 2 Statistics',
    initials: 'LR',
    team: 'Research',
    members: [
      {
        name: 'Dries Vincent',
        handle: 'driesvincent',
        imageUrl:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Lindsay Walton',
        handle: 'lindsaywalton',
        imageUrl:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Courtney Henry',
        handle: 'courtneyhenry',
        imageUrl:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
      {
        name: 'Tom Cook',
        handle: 'tomcook',
        imageUrl:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      },
    ],
    totalDocuments: 8,
    lastUpdated: 'March 17, 2020',
    pinned: true,
    bgColorClass: 'bg-pink-600',
  },
  // More projects...
];

const agents = [
  {
    id: 1,
    title: 'Summary',
    bgColorClass: 'bg-blue-600',

    initials: 'S',
    description: 'Summarize Context.',
    href: '#',
    imageUrl:
      'https://tailwindui.com/img/ecommerce-images/home-page-03-tool-01.jpg',
    imageAlt:
      'Person using a pen to cross a task off a productivity paper card.',
  },
  {
    id: 2,
    title: 'Observation',
    bgColorClass: 'bg-red-600',

    initials: 'O',
    description: 'Make Observations.',
    href: '#',
    imageUrl:
      'https://tailwindui.com/img/ecommerce-images/home-page-03-tool-02.jpg',
    imageAlt:
      'Person using a pen to cross a task off a productivity paper card.',
  },
  {
    id: 3,
    title: 'Topic',
    bgColorClass: 'bg-purple-600',
    initials: 'T',
    description: 'Relate to a topic.',
    href: '#',
    imageUrl:
      'https://tailwindui.com/img/ecommerce-images/home-page-03-tool-03.jpg',
    imageAlt:
      'Person using a pen to cross a task off a productivity paper card.',
  },
  {
    id: 3,
    title: 'Research',
    bgColorClass: 'bg-blue-800',
    initials: 'R',
    description: 'Research Notes.',
    href: '#',
    imageUrl:
      'https://tailwindui.com/img/ecommerce-images/home-page-03-tool-03.jpg',
    imageAlt:
      'Person using a pen to cross a task off a productivity paper card.',
  },
];
const pinnedProjects = projects.filter((project) => project.pinned);

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function () {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openNotesModal, setOpenNotesModal] = useState(false);
  const [openAgentModal, setOpenAgentModal] = useState(false);
  const [openAddContextModal, setOpenAddContextModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const session: Session | null = useSession();
  const userID = session?.user?.id;

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data, error } = useSWR(
    userID ? `/api/notes-page-data?userID=${userID}` : null,
    fetcher,
  );
  const notes = data?.notes?.map(
    (
      note: {
        color_theme: any;
        created_at: any;
        functionality: any;
        context: any;
        id: any;
        title: any[];
        description: any;
        agent_name: any;
      },
      i: number,
    ) => ({
      index: i + 1,
      note_id: note.id,
      title: note.title,
      context: note.context,
      functionality: note.functionality,
      agent_name: note.agent_name,
      created_at: formatDateTime(note.created_at), // Use the formatDateTime function here
      bgColorClass: note.color_theme,
    }),
  );

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
                  <div className="flex flex-shrink-0 items-center px-4">
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=purple&shade=500"
                      alt="Your Company"
                    />
                  </div>
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
                      <div className="mt-8">
                        <h3
                          className="px-3 text-sm font-medium text-gray-500"
                          id="mobile-teams-headline"
                        >
                          Teams
                        </h3>
                        <div
                          className="mt-1 space-y-1"
                          role="group"
                          aria-labelledby="mobile-teams-headline"
                        >
                          {teams.map((team) => (
                            <a
                              key={team.name}
                              href={team.href}
                              className="group flex items-center rounded-md px-3 py-2 text-base font-medium leading-5 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            >
                              <span
                                className={classNames(
                                  team.bgColorClass,
                                  'mr-4 h-2.5 w-2.5 rounded-full',
                                )}
                                aria-hidden="true"
                              />
                              <span className="truncate">{team.name}</span>
                            </a>
                          ))}
                        </div>
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
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-400 lg:bg-blue-50 lg:pb-4 lg:pt-5">
          <div className="flex flex-shrink-0 items-center px-6">
            <img
              className="h-8 w-auto"
              src="https://tailwindui.com/img/logos/mark.svg?color=purple&shade=500"
              alt="Your Company"
            />
          </div>
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="mt-5 flex h-0 flex-1 flex-col overflow-y-auto pt-1">
            {/* User account dropdown */}
            <Menu as="div" className="relative inline-block px-3 text-left">
              <div>
                <Menu.Button className="group w-full rounded-md bg-gray-100 px-3.5 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                  <span className="flex w-full items-center justify-between">
                    <span className="flex min-w-0 items-center justify-between space-x-3">
                      <img
                        className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-300"
                        src="https://slswakzyytknqjdgbdra.supabase.co/storage/v1/object/public/avatars/0.4863484854631659.jpg"
                        alt=""
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-gray-900">
                          Erlich Bachman
                        </span>
                        <span className="truncate text-sm text-gray-500">
                          @holdehnj
                        </span>
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
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
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
              <div className="mt-8">
                {/* Secondary navigation */}
                <h3
                  className="px-3 text-sm font-medium text-gray-500"
                  id="desktop-teams-headline"
                >
                  Agents
                </h3>
                <div
                  className="mt-1 space-y-1"
                  role="group"
                  aria-labelledby="desktop-teams-headline"
                >
                  {teams.map((team) => (
                    <a
                      key={team.name}
                      href={team.href}
                      className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <span
                        className={classNames(
                          team.bgColorClass,
                          'mr-4 h-2.5 w-2.5 rounded-full',
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{team.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
        {/* Main column */}
        <div className="flex flex-col lg:pl-64">
          {/* Search header */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white lg:hidden">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3CenterLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex flex-1">
                <form className="flex w-full md:ml-0" action="#" method="GET">
                  <label htmlFor="search-field" className="sr-only">
                    Search
                  </label>
                  <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                      <MagnifyingGlassIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="search-field"
                      name="search-field"
                      className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 focus:border-transparent focus:outline-none focus:ring-0 focus:placeholder:text-gray-400 sm:text-sm"
                      placeholder="Search"
                      type="search"
                    />
                  </div>
                </form>
              </div>
              <div className="flex items-center">
                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                      />
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
          </div>
          <main className="flex-1 bg-gray-100">
            {/* Page title & actions */}
            <div className="border-b bg-white border-gray-400 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-medium leading-6 text-gray-900 sm:truncate">
                  NotesAI
                </h1>
              </div>
              <div className="mt-4 flex sm:ml-4 sm:mt-0">
                <button
                  onClick={() => setOpenAgentModal(true)}
                  className="sm:order-0 order-1 ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-0"
                >
                  Select Agent
                </button>
                <AgentModal open={openAgentModal} setOpen={setOpenAgentModal} />
                <button
                  onClick={() => setOpenAddContextModal(true)}
                  className="order-0 inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 sm:order-1 sm:ml-3"
                >
                  Create Agent
                </button>
                <CreateAgentModal
                  open={openAddContextModal}
                  setOpen={setOpenAddContextModal}
                  setSuccess={setSuccess}
                />
              </div>
            </div>
            {/* Pinned projects */}
            <div className="mt-6 px-4 sm:px-6 lg:px-8 bg-gray-100">
              <h2 className="text-sm font-medium text-gray-900">Agents</h2>
              <ul
                role="list"
                className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4"
              >
                {agents.map((tool) => (
                  <li
                    key={tool.id}
                    className="relative col-span-1 flex rounded-md shadow-sm"
                  >
                    <a href="#" className="w-full flex">
                      <div
                        className={classNames(
                          tool.bgColorClass,
                          'flex w-16 flex-shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white',
                        )}
                      >
                        {tool.initials}
                      </div>
                      <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-b border-r border-t border-gray-600 bg-white hover:shadow-lg cursor-pointer">
                        <div className="flex-1 truncate px-4 py-2 text-sm h-full">
                          <p className="font-medium text-gray-900 hover:text-gray-600 mb-2">
                            {tool.title}
                          </p>
                          <p className="text-gray-500 h-full overflow-y-auto">
                            {tool.description}
                          </p>
                        </div>
                        <Menu as="div" className="flex-shrink-0 pr-2">
                          <Menu.Button className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                            <span className="sr-only">Open options</span>
                            <EllipsisVerticalIcon
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </Menu.Button>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-10 top-3 z-10 mx-3 mt-1 w-48 origin-top-right divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                                      View
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
                                      Removed from pinned
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
                                      Share
                                    </a>
                                  )}
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Projects list (only on smallest breakpoint) */}
            <div className="mt-10 sm:hidden">
              <div className="px-4 sm:px-6">
                <h2 className="text-sm font-medium text-gray-900">Notes</h2>
              </div>
              <ul
                role="list"
                className="mt-3 divide-y divide-gray-100 border-t border-gray-200"
              >
                {notes?.map((note: any) => (
                  <li key={note.index}>
                    <a
                      href={`/my-notes/${note.note_id}`}
                      className="group flex items-center justify-between px-4 py-4 hover:bg-gray-50 sm:px-6"
                    >
                      <span className="flex items-center space-x-3 truncate">
                        <span
                          className={classNames(
                            note.bgColorClass,
                            'h-2.5 w-2.5 flex-shrink-0 rounded-full',
                          )}
                          aria-hidden="true"
                        />
                        <span className="truncate text-sm font-medium leading-6">
                          {note.title}{' '}
                          <span className="truncate font-normal text-gray-500">
                            with {note.context}
                          </span>
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
            <div className="px-4 py-5 mt-6 sm:px-6 border-gray-200 border-t bg-white">
              <div className="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
                <div className="ml-4 mt-4">
                  <h1 className="text-base font-bold leading-6 text-gray-900">
                    Generate Notes
                  </h1>
                  <p className="mt-1 text-sm text-gray-400">
                    Generate notes for meetings, lectures, and so much more!
                  </p>
                </div>
                <div className="ml-4 mt-4 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setOpenNotesModal(true)}
                    className="relative inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Generate Notes
                  </button>
                  <GenerateNotesModal
                    open={openNotesModal}
                    setOpen={setOpenNotesModal}
                  />
                </div>
              </div>
            </div>
            {/* Projects table (small breakpoint and up) */}
            <div className="hidden sm:block">
              <div className="inline-block min-w-full border-b align-middle">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-t border-gray-200">
                      <th
                        className="border-b border-gray-200 bg-gray-100 px-6 py-3 text-left text-sm font-semibold text-gray-900"
                        scope="col"
                      >
                        <span className="lg:pl-2">Notes</span>
                      </th>
                      <th
                        className="border-b border-gray-200 bg-gray-100 px-6 py-3 text-left text-sm font-semibold text-gray-900"
                        scope="col"
                      >
                        Documents
                      </th>
                      <th
                        className="hidden border-b border-gray-200 bg-gray-100 px-6 py-3 text-right text-sm font-semibold text-gray-900 md:table-cell"
                        scope="col"
                      >
                        Last updated
                      </th>
                      <th
                        className="border-b border-gray-200 bg-gray-100 py-3 pr-6 text-right text-sm font-semibold text-gray-900"
                        scope="col"
                      />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {notes?.map((note: any) => (
                      <tr key={note.index}>
                        <td className="w-full max-w-0 whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-900">
                          <div className="flex items-center space-x-3 lg:pl-2">
                            <div
                              className={classNames(
                                note.bgColorClass,
                                'h-2.5 w-2.5 flex-shrink-0 rounded-full',
                              )}
                              aria-hidden="true"
                            />
                            <a
                              href={`/my-notes/${note.note_id}`}
                              className="truncate hover:text-gray-600"
                            >
                              <span>
                                {note.title}{' '}
                                <span className="font-normal text-gray-500">
                                  in {note.team}
                                </span>
                              </span>
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-500">
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-shrink-0 -space-x-1">
                              {note.agent_name}
                            </div>
                          </div>
                        </td>
                        <td className="hidden whitespace-nowrap px-6 py-3 text-right text-sm text-gray-500 md:table-cell">
                          {note.created_at}
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-medium">
                          <a
                            href={`/my-notes/${note.note_id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
