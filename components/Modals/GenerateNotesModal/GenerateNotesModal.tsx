import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import EmptyUpload from '@/components/EmptyUpload';
import { useSession } from '@supabase/auth-helpers-react';
import { useSWRConfig } from 'swr';
import * as Yup from 'yup';
import { supabaseClient } from '@/supabase-client';
import { useFormik } from 'formik';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useRouter } from 'next/router';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  userID: string | undefined;
}

interface FileDisplay {
  file: File;
  id: number;
}

function getRandomColor() {
  const colors = ['blue', 'red', 'green', 'gray', 'indigo', 'purple'];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return `bg-${randomColor}-600`;
}

export default function GenerateNotesModal(props: Props) {
  const { open, setOpen, userID } = props;
  const session = useSession();
  const cancelButtonRef = useRef(null);
  const [notesText, setNotesText] = useState(''); // Add this line
  const [convertedText, setConvertedText] = useState('');
  const [files, setFiles] = useState<FileDisplay[]>([]);
  const [fileObjects, setFileObjects] = useState<File[]>([]);
  const [nextId, setNextId] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [agentName, setAgentName] = useState<string>('Summary');
  const router = useRouter();
  const handleFile = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check if the uploaded file is an audio or video file
      const fileType = file.type.split('/')[0];
      if (fileType !== 'audio' && fileType !== 'video') {
        alert('Please upload an audio or video file');
        return;
      }

      const fileDisplay: FileDisplay = {
        file: file,
        id: nextId,
      };
      setFiles([...files, fileDisplay]);
      setFileObjects([...fileObjects, file]);

      setNextId(nextId + 1);
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

  // Add a new function to save the note to Supabase
  const insertAndNavigate = async (
    transcription: string,
    bulletPoints: string[],
    summary: string,
  ) => {
    if (!userID) return;

    const upload_ids: string[] = [];
    fileObjects.forEach((file) => {
      upload_ids.push(file.name);
    });

    try {
      const response = await fetch('/api/create-note-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID,
          fileObjects,
          formikValues: formik.values,
          agentName,
          transcription,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.log('error :>> ', data.error);
      } else {
        router.push(
          `/my-notes/${data.noteId}?transcription=${encodeURIComponent(
            transcription,
          )}&stream=true&bulletPoints=${encodeURIComponent(
            JSON.stringify(bulletPoints),
          )}&summary=${encodeURIComponent(summary)}`,
        );
      }
    } catch (error) {
      console.log('error :>> ', error);
    }
  };

  const sendAudio = async (file: File) => {
    try {
      if (!file) {
        alert('Please upload an audio file');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      const data = await supabaseClient.functions.invoke(
        'generate-transcription',
        {
          body: formData,
        },
      );
      const transcription = data.data.transcript.text;
      setConvertedText(transcription);
      return transcription;
    } catch (error: any) {
      console.log(JSON.stringify(error));

      alert(`Error: ${error.message}`);
    }
  };

  const createNotesSummary = async (
    content: string,
    callback: (summary: string) => void,
    accessToken: string,
  ) => {
    if (!content) {
      alert('Please upload a string file');
      return;
    }

    try {
      // Set the endpoint URL
      const endpoint = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-summary`;

      // Use fetchEventSource for streaming
      await fetchEventSource(endpoint, {
        method: 'POST',
        body: JSON.stringify({ transcription: content }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream', // Add the Accept header for streaming
          Authorization: `Bearer ${accessToken}`, // Add the Authorization header
        },
        onmessage: (ev) => {
          const summaryData = ev.data;
          callback(summaryData); // Call the callback function with the streamed summary data
        },
      });
    } catch (error: any) {
      console.log(JSON.stringify(error));
      alert(`Error: ${error.message}`);
    }
  };

  const createNotesFacts = async (content: string, context: string) => {
    if (!content) {
      alert('Please upload a string file');
      return;
    }
    try {
      const response = await fetch('/api/create-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcription: content,
          name: name,
          topic: context,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('createNotes error' + JSON.stringify(errorData));
        throw new Error(errorData.message);
      }

      const data = await response.json();
      const noteData = JSON.stringify(data.data.text);

      // Split the output at every newline and return an array of bullet points
      const bulletPoints = noteData
        .split('\\n')
        .filter((line) => line.length > 0);
      return bulletPoints;
    } catch (error: any) {
      console.log(JSON.stringify(error));
      alert(`Error: ${error.message}`);
    }
  };

  //formik validation
  const validationSchema = Yup.object({
    title: Yup.string().required('Required'),
    context: Yup.string(),
    functionality: Yup.string(),
  });

  const intialValues = {
    title: '',
    context: '',
    functionality: '',
  };

  const onSubmit = async (values: any, { resetForm }: any) => {
    //if no file and no youtube return
    if (fileObjects.length === 0) {
      return;
    }
    setLoading(true);

    const transcription = await sendAudio(fileObjects[0]);

    const session = useSession();
    const accessToken = session?.access_token; // Get the access token from the session

    let streamedSummary = '';
    await createNotesSummary(
      transcription,
      (summary) => {
        streamedSummary = summary;
      },
      accessToken as unknown as string,
    );

    const notes = await createNotesFacts(transcription, values.context);

    // Pass the streamedSummary to the insertAndNavigate function
    insertAndNavigate(
      transcription,
      notes as unknown as string[],
      streamedSummary,
    );
    resetForm();
    setLoading(false);
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
                          Topic:
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
                          />
                        </div>
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
                    * Only Audio Files are supported at this time
                  </p>
                  <p className="text-xs mt-2 italic text-gray-500">
                    * File Size is limited to 25 MB.
                  </p>
                  <p className="text-sm mt-2 italic text-gray-800">
                    Please be patient with loading times
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
                  {!loading ? (
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
                  ) : (
                    <div className="w-full text-center mt-3 text-sm font-semibold text-gray-900">
                      Loading...
                    </div>
                  )}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
