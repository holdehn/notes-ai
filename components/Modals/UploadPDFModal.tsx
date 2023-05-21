import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import EmptyUpload2 from './EmptyUpload2';
import { useSession } from '@supabase/auth-helpers-react';
import { useSWRConfig } from 'swr';
import * as Yup from 'yup';
import { supabaseClient } from '@/supabase-client';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { insertExtractedText, insertNote } from '@/components/api';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface FileDisplay {
  file: File;
  id: number;
}

export default function UploadPDFModal(props: Props) {
  const { open, setOpen } = props;
  const session = useSession();
  const userID = session?.user?.id;
  const cancelButtonRef = useRef(null);
  const [notesText, setNotesText] = useState(''); // Add this line
  const [convertedText, setConvertedText] = useState('');
  const [files, setFiles] = useState<FileDisplay | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [nextId, setNextId] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [agentName, setAgentName] = useState<string>('Summary');
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleFile = (e: any) => {
    if (fileObject) {
      setFiles(null);
      setFileObject(null);
    }

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileType = file.type.split('/')[0];
      const fileSubType = file.type.split('/')[1];

      if (
        fileType !== 'application' ||
        (fileType === 'application' &&
          fileSubType !== 'pdf' &&
          fileSubType !==
            'vnd.openxmlformats-officedocument.wordprocessingml.document')
      ) {
        alert('Please upload a PDF or DOCX file');
        return;
      }

      const fileDisplay: FileDisplay = {
        file: file,
        id: nextId,
      };
      setFiles(fileDisplay);
      setFileObject(file);
      setNextId(nextId + 1);
    }
  };

  const removeFile = () => {
    setFiles(null);
    setFileObject(null);
  };

  const handleClose = () => {
    if (loading) return;
    setFiles(null);
    setName('');
    setFileObject(null);
    setOpen(false);
    setLoading(false);
    setSubmitted(false); // Add this line
    formik.resetForm();
  };

  const loadPDF = async (file: File) => {
    try {
      if (!file) {
        alert('Please upload a PDF file');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/load-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      const extractedText = data.text;
      setConvertedText(extractedText);
      return extractedText;
    } catch (error: any) {
      console.log(JSON.stringify(error));

      alert(`Error: ${error.message}`);
    }
  };

  const loadDocx = async (file: File) => {
    try {
      if (!file) {
        alert('Please upload a docx file');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/load-docx', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      const extractedText = data.text;
      setConvertedText(extractedText);
      return extractedText;
    } catch (error: any) {
      console.log(JSON.stringify(error));
      alert(`Error: ${error.message}`);
    }
  };

  //formik validation
  const validationSchema = Yup.object({
    title: Yup.string().required('Required'),
  });

  const intialValues = {
    title: '',
  };
  const onSubmit = async (values: any, { resetForm }: any) => {
    // If no file and no YouTube return
    if (!fileObject) {
      return;
    }
    if (!userID) return;
    setLoading(true);
    setSubmitted(true);
    const id = uuidv4();
    const file = fileObject;
    const fileType = file.type.split('/')[0];
    const fileSubType = file.type.split('/')[1]; // define fileSubType here
    let extractedText;

    if (fileType === 'application') {
      if (
        fileSubType ===
        'vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        extractedText = await loadDocx(file);
      } else if (fileSubType === 'pdf') {
        extractedText = await loadPDF(file);
      }
    }

    // Client-side code (after extracting text from PDF or DOCX)
    try {
      console.log('Inserting note' + extractedText);
      console.log('userid' + userID);
      const { message, data } = await insertExtractedText({
        extractedText: extractedText,
        userId: userID,
      });
      console.log(message, data); // log the success message and the inserted data
    } catch (error: any) {
      console.error(`Error: ${error.message}`);
    }

    router.push(`/pdf-chat/${id}`);
    setFiles(null);
    setName('');
    setFileObject(null);

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
        onClose={() => {
          if (!loading) {
            handleClose();
          }
        }}
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gradient-to-r from-[#000000] via-[#000592] to-[#94295f] px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                {' '}
                <form onSubmit={formik.handleSubmit}>
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600">
                      <DocumentTextIcon
                        className="h-6 w-6 text-gray-50"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h2"
                        className="text-xl font-bold leading-6 text-gray-50"
                      >
                        Generate Notes
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-200">
                          Upload Files that you can chat with.
                        </p>
                      </div>
                      <div className="col-span-6 sm:col-span-4 mt-4">
                        <label
                          htmlFor="input-name"
                          className="block text-sm font-medium leading-6 text-gray-200 text-left"
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
                            onBlur={formik.handleBlur}
                            disabled={submitted}
                            className="block w-full bg-indigo-950 rounded-md border-0 pl-1.5 py-1.5 text-gray-300 shadow-sm ring-1 ring-inset ring-gray-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="e.g. Linear Regression Notes"
                          />
                          {formik.touched.title && formik.errors.title ? (
                            <div className="mt-2 text-red-500 text-sm">
                              {formik.errors.title}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-sm text-gray-200 font-medium text-left mt-8 block items-center">
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
                  {!loading && <EmptyUpload2 onFileChange={handleFile} />}
                  <p className="text-xs mt-2 italic text-gray-400">
                    * File Size is limited to 25 MB.
                  </p>
                  <p className="text-xs mt-2 italic text-gray-400">
                    * Only PDF and docx are accepted for chat.
                  </p>
                  <ul className="mt-4">
                    {files?.file?.name && (
                      <li className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-200 font-bold bg-gray-800 p-2 rounded-md">
                          {files?.file?.name}
                        </span>
                        {!loading && (
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeFile()}
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    )}
                  </ul>

                  {!loading ? (
                    <div className="mt-8 sm:mt-8 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                      >
                        Upload
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
                    <div className="w-full text-center mt-3 text-sm font-bold text-gray-200">
                      Uploading...this may take a moment.
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
