import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import EmptyUpload from '@/components/EmptyUpload';
import { useSession } from '@supabase/auth-helpers-react';
import { useSWRConfig } from 'swr';
import * as Yup from 'yup';
import { supabaseClient } from '@/supabase-client';
import { useFormik } from 'formik';
import { val } from 'cheerio/lib/api/attributes';
import SelectAgentMenu from '@/components/SelectAgentMenu';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface FileDisplay {
  file: File;
  id: number;
}

function getRandomColor() {
  const colors = [
    'blue',
    'pink',
    'red',
    'green',
    'yellow',
    'black',
    'gray',
    'indigo',
    'purple',
  ];
  const shades = [400, 500, 600, 700, 800];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const randomShade = shades[Math.floor(Math.random() * shades.length)];

  return `bg-${randomColor}-${randomShade}`;
}

export default function GenerateNotesModal(props: Props) {
  const { open, setOpen } = props;
  const session = useSession();
  const { mutate } = useSWRConfig();
  const cancelButtonRef = useRef(null);
  const [notesText, setNotesText] = useState(''); // Add this line
  const [convertedText, setConvertedText] = useState('');
  const [files, setFiles] = useState<FileDisplay[]>([]);
  const [fileObjects, setFileObjects] = useState<File[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const token = session?.access_token;
  const [name, setName] = useState<string>('');
  const [functionality, setFunctionality] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [agentName, setAgentName] = useState<string>('Summary');

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
    formik.resetForm();
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

  const sendAudio = async (file: File) => {
    setLoading(true);
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

      setLoading(false);
      setConvertedText(JSON.stringify(data.transcript.text));
      console.log('data :>> ', convertedText);
    } catch (error: any) {
      console.log(JSON.stringify(error));
      setLoading(false);
      alert(`Error: ${error.message}`);
    }
  };

  const createNotes = async (content: string) => {
    fetch('/api/create-notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcription: content,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setNotesText(JSON.stringify(data));
      });
  };

  //formik validation
  const validationSchema = Yup.object({
    title: Yup.string().required('Required'),
    context: Yup.string().required('Required'),
    functionality: Yup.string().required('Required'),
  });

  const intialValues = {
    title: '',
    context: '',
    functionality: '',
  };
  const onSubmit = async (values: any, { resetForm }: any) => {
    const user_id = session?.user?.id;
    if (!user_id) return;

    //add each file name to the fomrik array
    const upload_ids: string[] = [];
    fileObjects.forEach((file) => {
      upload_ids.push(file.name);
    });
    sendAudio(fileObjects[0]);
    if (convertedText) {
      const { data, error } = await supabaseClient.from('notes').insert([
        {
          title: values.title,
          context: values.context,
          functionality: values.functionality,
          upload_ids: upload_ids,
          user_id: user_id,
          agent_name: agentName,
          color_theme: getRandomColor(),
        },
      ]);
      if (error) {
        console.log('error :>> ', error);
      }
      if (data) {
        console.log('data :>> ', data);
      }
    } else {
      setFileObjects([]);
      setFiles([]);
      alert('Please upload an audio file with a clear voice');
      return;
    }

    resetForm();
    setFileObjects([]);
    setFiles([]);
    mutate('/api/notes');
    setOpen(false);
  };

  const formik = useFormik({
    initialValues: intialValues,
    validationSchema: validationSchema,
    onSubmit,
  });

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
                {' '}
                <form onSubmit={formik.handleSubmit}>
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <DocumentTextIcon
                        className="h-6 w-6 text-purple-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h2"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Generate Notes
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Upload recordings that will be transcribed and turned
                          into notes.
                        </p>
                      </div>
                      <div className="col-span-6 sm:col-span-4 mt-4">
                        <label
                          htmlFor="input-name"
                          className="block text-sm font-medium leading-6 text-gray-800 text-left"
                        >
                          Title:
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="title"
                            id="title"
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="e.g. Linear Regression Lecture"
                          />
                        </div>
                      </div>
                      <div className="col-span-6 sm:col-span-4 mt-4">
                        <label
                          htmlFor="input-name"
                          className="block text-sm font-medium leading-6 text-gray-800 text-left  items-center"
                        >
                          Context Description:
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
                            name="context"
                            id="context"
                            value={formik.values.context}
                            onChange={formik.handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="e.g. Lecture recording for Linear Regression"
                            // @ts-ignore
                            helperText={
                              formik.touched.context && formik.errors.context
                            }
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
                            name="functionality"
                            id="functionality"
                            value={formik.values.functionality}
                            onChange={formik.handleChange}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="e.g. Summarize and note important points"
                          />
                        </div>
                      </div>

                      <div className="col-span-6 sm:col-span-4 mt-4">
                        <label
                          htmlFor="input-name"
                          className="block text-sm font-medium leading-6 text-gray-800 text-left  items-center"
                        >
                          Agent:
                        </label>
                        <SelectAgentMenu setAgentName={setAgentName} />
                      </div>

                      <div className="mt-2">
                        <p className="text-sm text-gray-900 font-medium text-left mt-8 block items-center">
                          Upload Context:
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

                  <p className="text-xs mt-2 italic text-gray-500">
                    * Only Audio and Video files are supported currently.
                  </p>
                  <ul className="mt-4">
                    {files.map(({ file, id }) => (
                      <li key={id} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {file.name}
                        </span>
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
                      className="inline-flex w-full justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    >
                      Create Notes
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 border-red-900 py-2 text-sm font-semibold text-red-900 shadow-sm ring-1 ring-inset ring-red-900 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                      onClick={handleClose}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}