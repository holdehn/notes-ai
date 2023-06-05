import { Fragment, useState } from 'react';
import {
  PlusIcon,
  BookOpenIcon,
  ArrowRightIcon,
  PlusSmallIcon as Add,
  ChevronRightIcon,
} from '@heroicons/react/20/solid';
import { Session, useSession } from '@supabase/auth-helpers-react';

import useSWR from 'swr';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { HomeIcon, NewspaperIcon } from '@heroicons/react/20/solid';

import { useRouter } from 'next/router';

import CreateAssignmentModal from '../Modals/CreateAssignmentModal';
import ClassroomSidebar from '../ui/Sidebars/ClassroomSidebar';

export default function ClassroomComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [assignmentModal, setAssignmentModal] = useState<boolean>(false);
  const router = useRouter();

  const session: Session | null = useSession();
  const userID = session?.user?.id;
  const courseID = router.query.courseID as string;

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data, error } = useSWR(
    userID ? `/api/get-course?userID=${userID}&courseID=${courseID}` : null,
    fetcher,
  );

  if (!data) {
    return (
      <div className="min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const { assignments } = data;

  const { courseData } = data;

  const title = data?.courseData[0]?.title;
  const description = data?.courseData[0]?.description;
  const subject = data?.courseData[0]?.subject;

  const name = session?.user?.user_metadata?.full_name;
  const avatar_url = session?.user?.user_metadata?.avatar_url;

  const proxyUrl = '/api/proxy?imageUrl=';

  const finalImageUrl = proxyUrl + encodeURIComponent(avatar_url);

  return (
    <>
      <div className="min-h-screen">
        <ClassroomSidebar
          avatar={finalImageUrl}
          courseID={courseID}
          name={name}
          title={title}
          subject={subject}
        />
        <main className="lg:ml-64 bg-gray-200">
          <div className="relative min-h-screen p-6">
            {/* Projects list (only on smallest breakpoint) */}
            <div className="sm:hidden">
              <ul role="list">
                {assignments?.map((assignment: any, index: number) => (
                  <li key={assignment.index}>
                    <a
                      href={`/grading/assignment/${assignment.assignment_id}`}
                      className={`group flex items-center justify-between px-4 py-4 sm:px-6 ${
                        index % 2 === 0 ? 'bg-purple-100' : 'bg-indigo-100'
                      } hover:bg-purple-400`}
                    >
                      <span className="flex items-center space-x-3 truncate">
                        <span
                          className={classNames(
                            assignment.bgColorClass,
                            'h-2.5 w-2.5 flex-shrink-0 rounded-full',
                          )}
                          aria-hidden="true"
                        />
                        <span className="truncate text-sm font-medium leading-6 text-black">
                          {assignment.title}{' '}
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
                onClick={() => setAssignmentModal(true)}
                className="relative inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <span className="sr-only">Generate Notes</span>
                <PlusIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            {/* Projects table (small breakpoint and up) */}
            <div className="hidden sm:block md:flex md:items-center md:justify-between border-b border-gray-800 pb-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                  {title}
                </h2>
                <p className="mt-2 text-gray-600">
                  <span className="text-gray-500 font-semibold">
                    Description:
                  </span>{' '}
                  {description}
                  No description provided.
                </p>{' '}
              </div>
              <div className="hidden sm:block mt-4  md:ml-4 md:mt-0">
                <button
                  onClick={() => setAssignmentModal(true)}
                  type="button"
                  className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Create Assignment
                  <PlusIcon className="ml-2 h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="hidden sm:block pt-8">
              <div className="hidden sm:block">
                <div className="inline-block min-w-full border-b align-middle shadow-xl">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-t border-gray-600 bg-gray-950">
                        <th
                          className="border-b border-gray-600 bg-gray-950 px-6 py-3 text-left text-md font-semibold text-gray-200"
                          scope="col"
                        >
                          <span className="lg:pl-2">Active Assignments</span>
                        </th>

                        <th
                          className="hidden border-b border-gray-600 bg-950 px-6 py-3 text-right text-md font-semibold text-gray-200 md:table-cell"
                          scope="col"
                        >
                          Submissions
                        </th>

                        <th
                          className="hidden border-b border-gray-600 bg-950 px-6 py-3 text-right text-md font-semibold text-gray-200 md:table-cell"
                          scope="col"
                        >
                          Due Date
                        </th>
                        <th
                          className="border-b border-gray-600 bg-950 py-3 pr-6 text-right text-sm font-semibold text-gray-200"
                          scope="col"
                        />
                      </tr>
                    </thead>

                    <tbody
                      className={`divide-y divide-gray-600 ${
                        assignments?.length > 0 ? 'bg-purple-100' : ''
                      }`}
                    >
                      {assignments?.map((assignment: any, index: number) => (
                        <tr
                          key={assignment.id}
                          className={`group cursor-pointer hover:bg-gray-300 ${
                            index % 2 === 0 ? 'bg-gray-50' : 'bg-blue-50'
                          }`}
                          onClick={() =>
                            router.push(`/grading/assignment/${assignment.id}`)
                          }
                        >
                          <td className="w-full max-w-0 whitespace-nowrap px-6 py-3 text-sm font-medium text-black">
                            <div className="flex items-center space-x-3 lg:pl-2">
                              <a
                                href={`/grading/assignment/${assignment.id}`}
                                className="truncate "
                              >
                                <span>{assignment.title}</span>
                              </a>
                            </div>
                          </td>
                          <td className="w-full max-w-0 whitespace-nowrap px-6 py-3 text-sm font-medium text-black">
                            <div className="flex items-center space-x-3 lg:pl-2">
                              <a
                                href={`/grading/assignment/${assignment.id}`}
                                className="truncate "
                              >
                                <span>0/1</span>
                              </a>
                            </div>
                          </td>

                          <td className="hidden whitespace-nowrap px-6 py-3 text-right text-sm text-black md:table-cell">
                            {new Date(assignment.due_date).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-medium">
                            <a
                              href={`/my-assignment/${assignment.id}`}
                              className="text-indigo-600 group-hover:text-indigo-800"
                            >
                              {assignment.is_published === 'true' ? (
                                <span className="text-green-600">
                                  Published
                                </span>
                              ) : (
                                <span className="text-red-600">
                                  Unpublished
                                </span>
                              )}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {assignments?.length === 0 && (
                    <div className="flex justify-center items-center h-36 bg-gray-200">
                      <button onClick={() => setAssignmentModal(true)}>
                        <div className="text-black font-medium text-xl">
                          Create an assignment to get started!
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <CreateAssignmentModal
          open={assignmentModal}
          setOpen={setAssignmentModal}
          courseID={courseID}
        />
      </div>
    </>
  );
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
