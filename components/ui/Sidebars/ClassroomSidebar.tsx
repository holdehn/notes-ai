import { Fragment, useState } from 'react';
import { Dialog, Transition, Menu } from '@headlessui/react';
import {
  Cog6ToothIcon,
  ChartBarSquareIcon,
  XMarkIcon,
  PencilSquareIcon,
  NewspaperIcon,
  AcademicCapIcon,
  ArrowLeftIcon,
  UserGroupIcon,
  UserIcon,
  ChevronUpDownIcon,
} from '@heroicons/react/24/outline';
import { BookOpenIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import InviteModal from '@/components/Modals/InviteModal';

interface Props {
  avatar: string;
  courseID: string;
  name: string;
  title: string;
  subject: string;
}
export default function ClassroomSidebar({
  avatar,
  courseID,
  name,
  title,
  subject,
}: Props) {
  const router = useRouter();
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const handleNavigate = () => {
    router.push('/courses');
  };

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    });

    router.push('/');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: `/courses/${courseID}`,
      icon: ChartBarSquareIcon,
      current: true,
    },
    {
      name: 'Grading',
      href: `/courses/${courseID}/grading`,
      icon: NewspaperIcon,
      current: false,
    },
    {
      name: 'Notes',
      href: `/courses/${courseID}/notes`,
      icon: PencilSquareIcon,
      current: false,
    },
    {
      name: 'Roster',
      href: `/courses/${courseID}/roster`,
      icon: UserGroupIcon,
      current: false,
    },
    {
      name: 'Settings',
      href: `/courses/${courseID}/settings`,
      icon: Cog6ToothIcon,
      current: false,
    },
  ];

  return (
    <>
      <div>
        <div className="fixed inset-0 flex w-64">
          <div className="relative flex w-full max-w-xs flex-1">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
              <div>
                <div className="block mt-10">
                  <p className="text-lg font-bold text-white">{title}</p>
                </div>
                <div className="mt-4 flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpenIcon
                      className="h-6 w-6 text-gray-300"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300">
                      {subject} - {courseID}
                    </p>
                  </div>
                </div>

                <div
                  className={`border-b border-gray-200 pb-4 mt-4 justify-center`}
                >
                  <div className="flex-1 flex-col gap-y-2">
                    <button
                      onClick={() => setOpenInviteModal(true)}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-purple-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Invite
                    </button>
                    <InviteModal
                      open={openInviteModal}
                      setOpen={setOpenInviteModal}
                      inviteUrl={`https://automark.vercel.app/join-classroom?classCode=${courseID}`}
                    />
                    <button
                      onClick={() => handleNavigate()}
                      className="inline-flex items-center px-3 ml-2 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Back To Courses
                    </button>
                  </div>
                </div>
              </div>

              <nav className="flex flex-1 flex-col mb-auto">
                <ul role="list" className="-mx-2 flex-1 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={classNames(
                          item.current
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800',
                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold',
                        )}
                      >
                        <item.icon
                          className="h-6 w-6 shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <Menu
                as="div"
                className="relative inline-block mb-2 text-left mt-auto"
              >
                <div>
                  <Menu.Button className="group w-full rounded-md bg-gray-100 px-3.5 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                    <span className="flex w-full items-center justify-between">
                      <span className="flex min-w-0 items-center justify-between space-x-3">
                        {avatar ? (
                          <img
                            src={avatar}
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
                  <Menu.Items className="absolute left-0 bottom-0 z-10 mx-3 mb-1 origin-bottom divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
            </div>
          </div>
        </div>
        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-blue-950 px-4 py-2 shadow-sm sm:px-6 lg:ml-64">
          <div className="flex-1 text-sm font-semibold leading-6 text-white">
            Dashboard
          </div>
          <button onClick={handleNavigate}>
            <img className="h-8 w-auto rounded-full" src={avatar} alt="Yname" />
          </button>
        </div>
      </div>
    </>
  );
}

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
