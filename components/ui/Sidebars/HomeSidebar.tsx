import { Fragment, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  CheckBadgeIcon,
  ChevronUpDownIcon,
  PlusIcon,
  RectangleStackIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import { Bars3CenterLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CreateCourseModal from '@/components/Modals/CreateCourseModal';

interface Props {
  avatar: string;
  name: string;
  handleLogout: () => void;
}

export default function HomeSidebar(props: Props) {
  const { avatar, name, handleLogout } = props;
  const [openCourseModal, setOpenCourseModal] = useState(false);
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-white bg-gray-900 lg:pb-4 lg:pt-5 lg:px-4">
      <div className="mt-5 flex h-0 flex-1 flex-col overflow-y-auto pt-1">
        <div className="mx-auto lg:text-left">
          <h2 className="mt-3 text-2xl font-extrabold leading-9 text-white text-center">
            AutoMark
          </h2>
          <p className="mt-4 text-sm leading-6 text-gray-200 text-center">
            Welcome to AutoMark! Create a course to get started or click on an
            existing course to the right.
          </p>
        </div>
        <div className="py-6 sm:pl-6 lg:pl-8 xl:pl-0">
          <div className="flex-1 space-y-8">
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row xl:flex-col">
              <button
                onClick={() => setOpenCourseModal(true)}
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 xl:w-full"
              >
                <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                Create Course
              </button>
              <CreateCourseModal
                open={openCourseModal}
                setOpen={setOpenCourseModal}
              />

              <button
                type="button"
                className="mt-3 inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-3 sm:mt-0 xl:ml-0 xl:mt-3 xl:w-full"
              >
                Enroll in Course
              </button>
            </div>
          </div>
        </div>
        <Menu as="div" className="relative inline-block text-left mt-auto">
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
      </div>
    </div>
  );
}

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
