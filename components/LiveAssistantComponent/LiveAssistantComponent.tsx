import { Fragment, use, useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  Bars3CenterLeftIcon,
  Bars4Icon,
  ClockIcon,
  HomeIcon,
  XMarkIcon,
  NewspaperIcon,
  ChatBubbleLeftEllipsisIcon,
  TagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  ChevronRightIcon,
  ChevronUpDownIcon,
  EllipsisVerticalIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';
import SmartToyIcon from '@mui/icons-material/SmartToy';

import {
  ArrowLongLeftIcon,
  CheckIcon,
  HandThumbUpIcon,
  PaperClipIcon,
  QuestionMarkCircleIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import LiveTranscription from '../LiveTranscription';

const navigation = [
  { name: 'Home', href: '/home', icon: HomeIcon, current: false },
  { name: 'NotesAI', href: '/my-notes', icon: NewspaperIcon, current: false },
  {
    name: 'Live Assistant',
    href: '/live-assistant',
    icon: SmartToyIcon,
    current: true,
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
    title: 'Sales Call with John 4/19/2021',
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
const pinnedProjects = projects.filter((project) => project.pinned);

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(() => {});

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default function () {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [responseAI, setResponseAI] = useState<string>('');

  const sendAudio = async (file: File) => {
    try {
      if (!file) {
        alert('Please upload an audio file');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.log('errpr' + JSON.stringify(errorData));
        throw new Error(errorData.message);
      }

      const data = await res.json();
      console.log('data' + JSON.stringify(data));
      setTranscript(JSON.stringify(data));
    } catch (error: any) {
      console.log(JSON.stringify(error));

      alert(`Error: ${error.message}`);
    }
  };

  const handleEndSession = () => {
    setIsSessionActive(false);
    setSessionTime(0);
  };

  const handleStartSession = () => {
    setIsSessionActive(true);
    setSessionTime(0);
  };
  useInterval(
    () => {
      if (isSessionActive) {
        recordAndSend();
      }
    },
    isSessionActive ? 15000 : null,
  );

  const sendTranscriptToLiveAssistant = async (transcriptData: string) => {
    try {
      console.log('sending transcript to liveassistant' + transcriptData);
      const response = await fetch('/api/live-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: transcriptData }),
      });

      if (!response.ok) {
        throw new Error('Failed to send transcript to liveassistant');
      }
      const data = await response.json();
      console.log('response from liveassistant' + JSON.stringify(data));
      setResponseAI(data.response.output);
    } catch (error: any) {
      console.error('Error sending transcript to liveassistant:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(mediaStream);
      const chunks: Blob[] = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        chunks.push(event.data);
      });

      mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audio = new File([audioBlob], 'audio.webm', {
          type: 'audio/webm',
        });
        setAudioFile(audio);
      });

      mediaRecorder.start();

      return mediaRecorder;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      return null;
    }
  };

  const stopRecording = (mediaRecorder: MediaRecorder | null) => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  const recordAndSend = async () => {
    //dont record if session is
    const mediaRecorder = await startRecording();
    if (mediaRecorder) {
      setTimeout(() => {
        stopRecording(mediaRecorder);
      }, 15000);
    }
  };

  useEffect(() => {
    if (isSessionActive) {
      recordAndSend();
    }
  }, [isSessionActive]);

  useEffect(() => {
    if (isSessionActive && audioFile) {
      console.log('sending audio' + audioFile.name);
      sendAudio(audioFile);

      setAudioFile(null); // Remove the audio file from memory
    }
  }, [audioFile, isSessionActive]);

  useEffect(() => {
    if (isSessionActive && transcript) {
      console.log('sending transcript' + transcript);
      sendTranscriptToLiveAssistant(transcript);
      console.log('response from liveassistant' + responseAI);
    }
  }, [transcript, isSessionActive]);

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
          <main className="py-10 bg-gray-100">
            {/* Page header */}
            <div className="mx-auto bg-white max-w-3xl px-4 border-b p-4 border-t sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
              <div className="flex items-center space-x-5 mb-2">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      className="h-16 w-16 rounded-full"
                      src="https://slswakzyytknqjdgbdra.supabase.co/storage/v1/object/public/avatars/0.4863484854631659.jpg"
                      alt=""
                    />
                    <span
                      className="absolute inset-0 rounded-full shadow-inner"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Personal Assistant
                  </h1>
                  <p className="text-sm font-medium text-gray-500">
                    Current Agent:{' '}
                    <a href="#" className="text-gray-900">
                      Live
                    </a>{' '}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
                <LiveTranscription
                  onStartSession={handleStartSession}
                  onStopSession={handleEndSession}
                  isSessionActive={isSessionActive}
                  sessionTime={sessionTime}
                  setSessionTime={setSessionTime}
                />
              </div>
            </div>
            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
              <section
                aria-labelledby="timeline-title"
                className="lg:col-span-2 lg:col-start-1"
              >
                <div className="flow-root mt-6">
                  <ul role="list" className="-mb-8">
                    {activity.map((activityItem, activityItemIdx) => (
                      <li key={activityItem.id}>
                        <div className="relative pb-8">
                          {activityItemIdx !== activity.length - 1 ? (
                            <span
                              className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex items-start space-x-3">
                            {activityItem.type === 'comment' ? (
                              <>
                                <div className="relative">
                                  {activityItem.imageUrl ? (
                                    <img
                                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-400 ring-8 ring-white"
                                      src={activityItem.imageUrl}
                                      alt=""
                                    />
                                  ) : (
                                    <div className="relative">
                                      <div>
                                        <div className="relative px-1">
                                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                                            <UserCircleIcon
                                              className="h-5 w-5 text-gray-500"
                                              aria-hidden="true"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-white px-0.5 py-px">
                                    <ChatBubbleLeftEllipsisIcon
                                      className="h-5 w-5 text-gray-400"
                                      aria-hidden="true"
                                    />
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div>
                                    <div className="text-sm">
                                      <a
                                        href={activityItem.person.href}
                                        className="font-medium text-gray-900"
                                      >
                                        {activityItem.person.name}
                                      </a>
                                    </div>
                                    <p className="mt-0.5 text-sm text-gray-500">
                                      Heard in conversation
                                    </p>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-700">
                                    {/* <p>{userQuote}</p> */}
                                  </div>
                                </div>
                              </>
                            ) : activityItem.type === 'assignment' ? (
                              <>
                                <div>
                                  <div className="relative px-1">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                                      <UserCircleIcon
                                        className="h-5 w-5 text-gray-500"
                                        aria-hidden="true"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1 py-1.5">
                                  <div className="text-sm text-gray-500">
                                    <a
                                      href={activityItem.person.href}
                                      className="font-medium text-gray-900"
                                    >
                                      {activityItem.person.name}
                                    </a>{' '}
                                    Context Search{' '}
                                    <span className="whitespace-nowrap">
                                      {activityItem.date}
                                    </span>
                                  </div>
                                </div>
                              </>
                            ) : activityItem.type === 'tags' ? (
                              <>
                                <div>
                                  <div className="relative px-1">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                                      <UserCircleIcon
                                        className="h-5 w-5 text-gray-500"
                                        aria-hidden="true"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1 py-0">
                                  <div className="text-sm leading-8 text-gray-500">
                                    <span className="mr-0.5">
                                      <a
                                        href={activityItem.person.href}
                                        className="font-medium text-gray-900"
                                      >
                                        {activityItem.person.name}
                                      </a>{' '}
                                      added topics
                                    </span>{' '}
                                    <span className="mr-0.5">
                                      {activityItem?.tags?.map((tag): any => (
                                        <Fragment key={tag.name}>
                                          <a
                                            href={tag.href}
                                            className="relative inline-flex items-center rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                          >
                                            <span className="absolute flex flex-shrink-0 items-center justify-center">
                                              <span
                                                className={classNames(
                                                  tag.color,
                                                  'h-1.5 w-1.5 rounded-full',
                                                )}
                                                aria-hidden="true"
                                              />
                                            </span>
                                            <span className="ml-3 font-semibold text-gray-900">
                                              {tag.name}
                                            </span>
                                          </a>{' '}
                                        </Fragment>
                                      ))}
                                    </span>
                                    <span className="whitespace-nowrap">
                                      {activityItem.date}
                                    </span>
                                  </div>
                                </div>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
              <section
                aria-labelledby="timeline-title"
                className="lg:col-span-1 lg:col-start-3"
              >
                <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
                  <h2
                    id="timeline-title"
                    className="text-lg font-medium text-gray-900"
                  >
                    Transcription
                  </h2>

                  <div className="mt-6 flow-root">
                    <ul role="list" className="-mb-8">
                      {timeline.map((item, itemIdx) => (
                        <li key={item.id}>
                          <div className="relative pb-8">
                            {itemIdx !== timeline.length - 1 ? (
                              <span
                                className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span
                                  className={classNames(
                                    item.type.bgColorClass,
                                    'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                                  )}
                                >
                                  <item.type.icon
                                    className="h-5 w-5 text-white"
                                    aria-hidden="true"
                                  />
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    {item.content}{' '}
                                    <a
                                      href="#"
                                      className="font-medium text-gray-900"
                                    >
                                      {item.target}
                                    </a>
                                  </p>
                                </div>
                                <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                  <time dateTime={item.datetime}>
                                    {item.date}
                                  </time>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 flex flex-col justify-stretch">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Archive Session
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
const user = {
  name: 'Whitney Francis',
  email: 'whitney@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
};

const breadcrumbs = [
  { name: 'Jobs', href: '#', current: false },
  { name: 'Front End Developer', href: '#', current: false },
  { name: 'Applicants', href: '#', current: true },
];
const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Settings', href: '#' },
  { name: 'Sign out', href: '#' },
];
const attachments = [
  { name: 'resume_front_end_developer.pdf', href: '#' },
  { name: 'coverletter_front_end_developer.pdf', href: '#' },
];
const eventTypes = {
  applied: { icon: UserIcon, bgColorClass: 'bg-gray-400' },
  advanced: { icon: HandThumbUpIcon, bgColorClass: 'bg-blue-500' },
  completed: { icon: CheckIcon, bgColorClass: 'bg-green-500' },
};
const timeline = [
  {
    id: 1,
    type: eventTypes.applied,
    content: 'Applied to',
    target: 'Front End Developer',
    date: 'Sep 20',
    datetime: '2020-09-20',
  },
  {
    id: 2,
    type: eventTypes.advanced,
    content: 'Advanced to phone screening by',
    target: 'Bethany Blake',
    date: 'Sep 22',
    datetime: '2020-09-22',
  },
  {
    id: 3,
    type: eventTypes.completed,
    content: 'Completed phone screening with',
    target: 'Martha Gardner',
    date: 'Sep 28',
    datetime: '2020-09-28',
  },
  {
    id: 4,
    type: eventTypes.advanced,
    content: 'Advanced to interview by',
    target: 'Bethany Blake',
    date: 'Sep 30',
    datetime: '2020-09-30',
  },
  {
    id: 5,
    type: eventTypes.completed,
    content: 'Completed interview with',
    target: 'Katherine Snyder',
    date: 'Oct 4',
    datetime: '2020-10-04',
  },
];
const comments = [
  {
    id: 1,
    name: 'Leslie Alexander',
    date: '4d ago',
    imageId: '1494790108377-be9c29b29330',
    body: 'Ducimus quas delectus ad maxime totam doloribus reiciendis ex. Tempore dolorem maiores. Similique voluptatibus tempore non ut.',
  },
  {
    id: 2,
    name: 'Michael Foster',
    date: '4d ago',
    imageId: '1519244703995-f4e0f30006d5',
    body: 'Et ut autem. Voluptatem eum dolores sint necessitatibus quos. Quis eum qui dolorem accusantium voluptas voluptatem ipsum. Quo facere iusto quia accusamus veniam id explicabo et aut.',
  },
  {
    id: 3,
    name: 'Dries Vincent',
    date: '4d ago',
    imageId: '1506794778202-cad84cf45f1d',
    body: 'Expedita consequatur sit ea voluptas quo ipsam recusandae. Ab sint et voluptatem repudiandae voluptatem et eveniet. Nihil quas consequatur autem. Perferendis rerum et.',
  },
];

const activity = [
  {
    id: 1,
    type: 'comment',
    person: { name: 'Erlich Bachman', href: '#' },
    imageUrl:
      'https://slswakzyytknqjdgbdra.supabase.co/storage/v1/object/public/avatars/0.4863484854631659.jpg',
    date: 'now',
  },
  {
    id: 2,
    type: 'assignment',
    person: { name: 'Live Agent', href: '#' },
    assigned: { name: 'Kristin Watson', href: '#' },
  },
  {
    id: 3,
    type: 'tags',
    person: { name: 'Live Agent', href: '#' },
    tags: [
      { name: 'Sales Call', href: '#', color: 'bg-rose-500' },
      { name: 'Pied Piper', href: '#', color: 'bg-indigo-500' },
    ],
  },
  {
    id: 4,
    type: 'comment',
    person: { name: 'Live Agent', href: '#' },
    comment:
      "Erlich, remember to focus on the key selling points of Pied Piper, such as its innovative compression algorithm, data efficiency, and scalability. Speak confidently and calmly, and listen to the client's needs, concerns, and questions. Address their concerns with specific examples of how Pied Piper can benefit their business, and highlight any case studies or success stories. Show them the value they'll receive from the investment and remember to be genuine and authentic in your approach. Good luck!",
  },
];
