import { useRouter } from 'next/router';
import { ChevronRightIcon, PlusIcon } from '@heroicons/react/20/solid';
import GeneratePublicNotesModal from '@/components/GeneratePublicNotesModal';
import { useState } from 'react';

interface publicNotesTableProps {
  notes: any;
}

export default function PublicNotesTable(props: publicNotesTableProps) {
  const { notes } = props;
  const router = useRouter();
  const [openNotesModal, setOpenNotesModal] = useState(false);

  const maxRows = 8;

  return (
    <main className="flex-1 p-8 px-24">
      {/* Page title & actions */}
      <div className="px-8 py-8 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 bg-gray-200">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold leading-6 text-black sm:truncate">
            Public Notes
          </h1>
          <p className="mt-1 text-sm text-gray-900">
            Generate high quality lecture notes instantly!
          </p>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setOpenNotesModal(true)}
            className="relative sm:block hidden items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-base font-semibold text-white shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition duration-150 ease-in-out"
          >
            Generate Notes
          </button>
          <GeneratePublicNotesModal
            open={openNotesModal}
            setOpen={setOpenNotesModal}
          />
        </div>
      </div>

      {/* Projects list (only on smallest breakpoint) */}
      <div className="sm:hidden">
        <ul role="list">
          {notes?.slice(0, maxRows).map((note: any, index: number) => (
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
                {notes?.slice(0, maxRows).map((note: any, index: number) => (
                  <tr
                    key={note.index}
                    className={`group cursor-pointer hover:bg-purple-400 ${
                      index % 2 === 0 ? 'bg-purple-100' : 'bg-indigo-100'
                    }`}
                    onClick={() => router.push(`/${note.note_id}`)}
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
  );
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
