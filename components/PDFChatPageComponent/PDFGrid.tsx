import { Menu, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';

interface File {
  title: string;
  size: string;
  source: string;
}

interface Props {
  file: File[];
}

export default function PDFGrid({ file }: Props) {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
    >
      {file?.map((file) => (
        <li
          key={file.source}
          className="overflow-hidden rounded-xl border border-gray-200"
        >
          <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
            <embed
              src={file.source}
              type="application/pdf"
              aria-label={`Preview of ${file.title}`}
              className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
            />
            <div className="text-sm font-medium leading-6 text-gray-900">
              {file.title}
            </div>
            <Menu as="div" className="relative ml-auto">
              <Menu.Button className="-m-2.5 block p-2.5 text-gray-400 hover:text-gray-500">
                <span className="sr-only">Open options</span>
                <EllipsisHorizontalIcon
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
                <Menu.Items className="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href={file.source}
                        target="_blank"
                        className={`block px-3 py-1 text-sm leading-6 text-gray-900 ${
                          active ? 'bg-gray-50' : ''
                        }`}
                      >
                        View<span className="sr-only">, {file.title}</span>
                      </a>
                    )}
                  </Menu.Item>
                  {/* Add more Menu.Items here if you have additional actions */}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
          <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Size</dt>
              <dd className="text-gray-700">{file.size}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
