import { Fragment, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import { PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  Session,
  useSession,
  useSupabaseClient,
} from '@supabase/auth-helpers-react';

import useSWR from 'swr';
import {
  NewspaperIcon,
  PencilIcon,
  UserIcon,
  HomeIcon,
  CloudArrowUpIcon,
  ChevronRightIcon,
  PlusIcon,
} from '@heroicons/react/20/solid';
import router, { useRouter } from 'next/router';
import CreateAssignmentModal from '../Modals/CreateAssignmentModal';
import HomeSidebar from '../ui/Sidebars/HomeSidebar';
import Cards from '../ui/components/ClassCards';
import Divider from '../ui/components/Divider';
import ClassCards from '../ui/components/ClassCards';
import CreateCourseModal from '../Modals/CreateCourseModal';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [openCourseModal, setOpenCourseModal] = useState<boolean>(false);
  const router = useRouter();
  const handleCardClick = (courseID: string) => {
    router.push(`/course/${courseID}`);
  };

  const session: Session | null = useSession();
  const userID = session?.user?.id;

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data, error } = useSWR(
    `/api/get-course-data?userID=${userID}`,
    fetcher,
  );

  if (error) return <div>failed to load</div>;
  if (!data) return <div>loading...</div>;

  const { courses } = data || {};

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    router.push('/');
  };

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
        <HomeSidebar
          avatar={finalImageUrl}
          name={name}
          handleLogout={handleLogout}
        />
        {/* Main column */}
        <div className="flex flex-col lg:pl-72">
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

          <main>
            <div className="bg-gray-100 relative min-h-screen">
              <div className="p-12 sm:pb-32">
                <div className=" max-w-full">
                  <div className="mx-auto lg:text-left">
                    <h2 className="mt-3 text-2xl font-bold leading-9 text-black">
                      My Courses
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-gray-500">
                      Create a course to start automating your grading process.
                    </p>
                  </div>
                  <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 lg:gap-x-12">
                    <Divider />
                  </div>
                  <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 lg:gap-x-12">
                    <ClassCards
                      courses={courses}
                      setOpen={setOpenCourseModal}
                    />
                  </div>
                  <CreateCourseModal
                    open={openCourseModal}
                    setOpen={setOpenCourseModal}
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

const navigation = [
  {
    name: 'Home',
    href: '/courses',
    icon: HomeIcon,
    current: true,
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
    current: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
