import { Fragment, useMemo, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  Bars3CenterLeftIcon,
  XMarkIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import { useSession } from '@supabase/auth-helpers-react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import useSWR from 'swr';

import Link from 'next/link';

import {
  CheckIcon,
  HandThumbUpIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import { useRouter } from 'next/router';
import { createNotesFacts, createNotesSummary } from '../api';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

async function saveChanges(noteId: any, userId: any, summary: any, notes: any) {
  // Save the summary
  const summaryResponse = await fetch('/api/update-note-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ noteId, userId, summary }),
  });

  const summaryData = await summaryResponse.json();
  if (!summaryResponse.ok) {
    console.error('Error updating summary', summaryData);
    return;
  }

  // Save the notes
  const notesResponse = await fetch('/api/update-note-facts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ noteId, userId, notes }),
  });

  const notesData = await notesResponse.json();
  if (!notesResponse.ok) {
    console.error('Error updating notes', notesData);
    return;
  }

  console.log('Summary and Notes updated successfully');
}

export default function NoteDetailsComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [bulletPoints, setBulletPoints] = useState<string>('');
  const [showSaveButton, setShowSaveButton] = useState(false);
  const session = useSession();
  const user_id = session?.user?.id;
  const router = useRouter();
  const noteId = router.query.noteID;

  const name = session?.user?.user_metadata?.full_name;
  const avatar_url = session?.user?.user_metadata?.avatar_url;

  const proxyUrl = '/api/proxy?imageUrl=';
  const finalImageUrl = proxyUrl + encodeURIComponent(avatar_url);

  const fetcher = async (url: RequestInfo | URL) => {
    const res = await fetch(url);
    const data = await res.json();

    const tasks = [];

    if (!data.note?.[0].summary) {
      tasks.push(
        createNotesSummary(
          {
            transcription: data.note?.[0].transcription,
            userId: user_id as unknown as string,
            noteId: noteId as unknown as string,
            name: data.note?.[0].name,
            topic: data.note?.[0].topic,
            type: data.note?.[0].type,
          },
          (summary) => setSummaryText(summary),
        ),
      );
    } else {
      setSummaryText(data.note?.[0].summary);
    }

    if (!data.note?.[0].notes) {
      tasks.push(
        createNotesFacts(
          {
            transcription: data.note?.[0].transcription,
            userId: user_id as unknown as string,
            noteId: noteId as unknown as string,
            name: data.note?.[0].name,
            topic: data.note?.[0].topic,
            type: data.note?.[0].type,
          },
          (notes) => setBulletPoints(notes.join('\n')),
        ),
      );
    } else {
      setBulletPoints(data.note?.[0].notes);
    }

    if (tasks.length > 0) {
      await Promise.all(tasks);
    }

    return data;
  };

  const {
    data: noteData,
    error: noteError,
    mutate,
  } = useSWR(
    user_id && noteId
      ? `/api/get-note?noteId=${noteId}&userId=${user_id}`
      : null,
    fetcher,
    {
      refreshInterval: 0,
    },
  );

  if (!noteData) {
    return <div>Loading...</div>;
  }
  const { note } = noteData;
  console.log('note data', note);

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    });

    router.push('/');
  };

  const handleSave = async () => {
    await saveChanges(noteId, user_id, summaryText, bulletPoints);
  };

  const exportToDocx = async () => {
    // Extract the title, summary, and bullet points from the HTML
    const title = note?.[0].title;
    const summary = summaryText;
    const bulletPointsArray = (bulletPoints || '')
      .slice(2, -2)
      .split('- ')
      .filter((point) => point.trim().length > 0);

    // Create the Paragraph elements for the docx file
    const titleParagraph = new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 28 })],
      spacing: { after: 200 },
    });

    const summaryParagraph = new Paragraph({
      children: [new TextRun({ text: 'Summary: ' + summary })],
      spacing: { after: 200 },
    });

    const bulletPointParagraphs = bulletPointsArray.map(
      (point) =>
        new Paragraph({
          children: [new TextRun({ text: '- ' + point.trim() })],
          spacing: { after: 120 },
        }),
    );

    // Create the section with the extracted content
    const section = {
      children: [titleParagraph, summaryParagraph, ...bulletPointParagraphs],
    };

    // Create the docx Document
    const doc = new Document({
      sections: [section],
    });

    // Generate the docx file buffer
    const buffer = await Packer.toBuffer(doc);

    // Save the buffer as a file or provide it as a download in the browser
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    saveAs(blob, 'exported-notes.docx');
  };

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
                <Menu.Button className="group w-full rounded-md from-indigo-950 to-indigo-900 px-3.5 py-2 text-left text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-indigo-800">
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

          <main className="bg-gradient-to-r from-[#000000] via-[#000592] to-[#570d32]">
            {/* Page title & actions */}
            <div className="border-b bg-black border-gray-400 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-medium leading-6 text-gray-100 sm:truncate">
                  NotesAI
                </h1>
              </div>
            </div>
            {/* Page header */}
            <div className="px-6 py-2">
              <div className="mt-2 md:flex md:items-center md:justify-between">
                <nav className="sm:hidden" aria-label="Back">
                  <Link href="/my-notes">
                    <div className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                      <ChevronLeftIcon
                        className="-ml-1 mr-1 h-5 w-5 flex-shrink-0 text-gray-400"
                        aria-hidden="true"
                      />
                      Back
                    </div>
                  </Link>
                </nav>
                <nav
                  className="leading-7 hidden sm:flex"
                  aria-label="Breadcrumb"
                >
                  <ol role="list" className="flex items-center space-x-4">
                    <li>
                      <div className="flex">
                        <Link href="/my-notes">
                          <div className="text-sm font-medium text-gray-500 hover:text-gray-700">
                            My Notes
                          </div>
                        </Link>
                      </div>
                    </li>
                    <li>
                      <div className="flex leading-7 items-center">
                        <ChevronRightIcon
                          className="h-5 w-5 flex-shrink-0 text-gray-400"
                          aria-hidden="true"
                        />
                        <Link href="/my-notes/1">
                          <div className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                            {note?.[0].title}
                          </div>
                        </Link>
                      </div>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>{' '}
            <div className="pb-4 mx-auto mt-4 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2 lg:col-start-1">
                {/* Description list*/}
                <section
                  id="editable-content"
                  contentEditable="true"
                  aria-labelledby="applicant-information-title"
                >
                  <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 bg-gray-100">
                      <h2
                        id="applicant-information-title"
                        className="text-lg font-bold leading-6 text-gray-900"
                      >
                        {note?.[0].title}
                      </h2>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <dt className="text-md font-bold text-gray-500">
                            Summary
                          </dt>

                          <dd className="mt-1 text-sm text-gray-900">
                            {summaryText}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-md font-bold text-gray-500">
                            Notes
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {(bulletPoints || '')
                              .slice(2, -2)
                              .split('- ')
                              .filter((point) => point.trim().length > 0)
                              .map((point: string, index: number) => (
                                <p key={index} className="leading-8">
                                  {'- ' + point.trim()}
                                </p>
                              ))}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <div>
                      <a
                        href="#"
                        className="block bg-gray-50 px-4 py-4 text-center text-sm font-medium text-gray-500 hover:text-gray-700 sm:rounded-b-lg"
                      >
                        Generate More
                      </a>
                    </div>
                  </div>
                </section>
              </div>

              <section
                aria-labelledby="timeline-title"
                className="lg:col-span-1 lg:col-start-3"
              >
                <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
                  <h2
                    id="timeline-title"
                    className="text-lg font-medium text-gray-900"
                  >
                    Details
                  </h2>

                  {/* Activity Feed */}
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
                      onClick={exportToDocx}
                      className="inline-flex items-center justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Export Notes
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

const eventTypes = {
  applied: { icon: UserIcon, bgColorClass: 'bg-gray-400' },
  advanced: { icon: HandThumbUpIcon, bgColorClass: 'bg-blue-500' },
  completed: { icon: CheckIcon, bgColorClass: 'bg-green-500' },
};
const timeline = [
  {
    id: 1,
    type: eventTypes.applied,
    content: 'Owner:',
    target: 'User',
  },
  {
    id: 2,
    type: eventTypes.completed,
    content: 'Topic: ',
    target: 'Linear Regression Notes',
  },
  {
    id: 4,
    type: eventTypes.completed,
    content: 'Date Created:',
    target: '5/12/2021',
  },
  {
    id: 5,
    type: eventTypes.completed,
    content: 'File Type:',
    target: 'Audio',
  },
];

const navigation = [
  { name: 'NotesAI', href: '/my-notes', icon: NewspaperIcon, current: true },
  {
    name: 'PDF Chat',
    href: '/pdf-chat',
    icon: SmartToyIcon,
    current: false,
  },
  {
    name: 'Research',
    href: '#research',
    icon: MagnifyingGlassIcon,
    current: false,
  },

  {
    name: 'Settings',
    href: '#settings',
    icon: Bars3CenterLeftIcon,
    current: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
