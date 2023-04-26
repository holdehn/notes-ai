import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import EmptyUpload from '../EmptyUpload';
import { useSession } from '@supabase/auth-helpers-react';
import { useSWRConfig } from 'swr';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSessionStart: () => void;
}

interface FileDisplay {
  file: File;
  id: number;
}

export default function LiveAgentOptions(props: Props) {
  const { open, setOpen, onSessionStart } = props;
  const session = useSession();
  const { mutate } = useSWRConfig();
  const cancelButtonRef = useRef(null);
  const [files, setFiles] = useState<FileDisplay[]>([]);
  const [fileObjects, setFileObjects] = useState<File[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const token = session?.access_token;
  const [name, setName] = useState<string>('');
  const [functionality, setFunctionality] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFile = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileDisplay: FileDisplay = {
        file: file,
        id: nextId,
      };
      setFiles([...files, fileDisplay]);
      setFileObjects([...fileObjects, file]);

      setNextId(nextId + 1);
      console.log('files :>> ', files, fileObjects);
    }
  };

  const removeFile = (id: number) => {
    const newFiles = files.filter((file) => file.id !== id);
    const newFileObjects = fileObjects.filter(
      (file) => file.name !== files[id].file.name,
    );
    setFiles(newFiles);
    setFileObjects(newFileObjects);
  };

  const handleClose = () => {
    setFiles([]);
    setName('');
    setFileObjects([]);
    setOpen(false);
  };

  const uploadFiles = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('agent_name', name);

      fileObjects.forEach((file) => {
        formData.append('files', file, file.name);
      });

      const response = await fetch('/api/upload-context', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      // Handle successful upload (e.g., show success message, clear file list)
      setFiles([]);
      setOpen(false);
      setFileObjects([]);
      mutate('/api/agents');
      setName('');
    } catch (error: any) {
      // Handle error (e.g., show error message)
      console.error(error.message);
    }
  };
  const initialValues = {
    name: '',
    functionality: '',
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={handleClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <UserCircleIcon
                      className="h-6 w-6 text-purple-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h2"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      Live Agent Options
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Customize your own autonomous AI agent.
                      </p>
                    </div>
                    <div className="col-span-6 sm:col-span-4 mt-4">
                      <label
                        htmlFor="input-name"
                        className="block text-sm font-medium leading-6 text-gray-800 text-left"
                      >
                        Name:
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="input-name"
                          id="input-name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="e.g. Personal Assistant"
                        />
                      </div>
                    </div>
                    <div className="col-span-6 sm:col-span-4 mt-4">
                      <label
                        htmlFor="input-name"
                        className="block text-sm font-medium leading-6 text-gray-800 text-left  items-center"
                      >
                        Functionality:
                        <span className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                          <i
                            className="fas fa-question-circle"
                            title="Provide a brief description of the main function of the tool."
                          ></i>
                        </span>
                      </label>
                      <div className="mt-2">
                        <input
                          type="text"
                          name="input-name"
                          id="input-name"
                          value={functionality}
                          onChange={(e) => setFunctionality(e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="e.g. Help me do research"
                        />
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm text-gray-900 font-medium text-left mt-8 block items-center">
                        Upload documents:
                        <span className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer">
                          <i
                            className="fas fa-question-circle"
                            title="Upload any relevant documents that will help the tool perform its function."
                          ></i>
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <EmptyUpload onFileChange={handleFile} />

                <p className="text-xs italic text-gray-500 mt-2">
                  * PDF, DOC, DOCX, TXT, and RTF files are supported.
                  <p className="text-xs italic text-gray-500">
                    * Audio and video files will be transcribed.
                  </p>
                </p>
                <ul className="mt-4">
                  {files.map(({ file, id }) => (
                    <li key={id} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{file.name}</span>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeFile(id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 sm:mt-8 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    onClick={uploadFiles}
                  >
                    Create Agent
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={handleClose}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
