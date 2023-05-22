import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import EmptyUpload from '@/components/EmptyUpload';
import { useSession } from '@supabase/auth-helpers-react';
import { useSWRConfig } from 'swr';
import * as Yup from 'yup';
import { supabaseClient } from '@/supabase-client';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import {
  createNotesFacts,
  createNotesSummary,
  insertPublicNote,
} from '@/components/api';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface FileDisplay {
  file: File;
  id: number;
}

export default function GeneratePublicNotesModal(props: Props) {
  const { open, setOpen } = props;
  const cancelButtonRef = useRef(null);

  const [convertedText, setConvertedText] = useState('');
  const [files, setFiles] = useState<FileDisplay | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [nextId, setNextId] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
        (fileType !== 'audio' &&
          fileType !== 'video' &&
          fileType !== 'application') ||
        (fileType === 'application' &&
          fileSubType !== 'pdf' &&
          fileSubType !==
            'vnd.openxmlformats-officedocument.wordprocessingml.document') // Add check for docx file
      ) {
        alert('Please upload an audio, video, PDF, or docx file');
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
      alert(`Error: ${error.message}`);
    }
  };

  const convertVideoToMp3 = async (videoFile: string | Blob | Buffer) => {
    try {
      // Create an FFmpeg instance
      const ffmpeg = createFFmpeg({ log: true });

      // Load the FFmpeg instance
      await ffmpeg.load();

      // Write the video file to FFmpeg's file system
      const inputFileName =
        fileObject?.type.split('/')[1] === 'webm' ? 'input.webm' : 'input.mp4';
      ffmpeg.FS('writeFile', inputFileName, await fetchFile(videoFile));

      // Run the FFmpeg command to convert the video to MP3
      await ffmpeg.run(
        '-i',
        inputFileName,
        '-vn',
        '-b:a',
        '128k',
        'output.mp3',
      );

      // Read the output MP3 file from FFmpeg's file system
      const audioData = ffmpeg.FS('readFile', 'output.mp3');

      // Create a Blob from the output MP3 data
      const audioBlob = new Blob([audioData.buffer], { type: 'audio/mp3' });

      // Convert the Blob to a File
      const audioFile = new File([audioBlob], 'audio.mp3', {
        type: 'audio/mp3',
      });

      // Return the audio file
      return audioFile;
    } catch (error) {
      console.error(error);
      throw error;
    }
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
    topic: Yup.string().required('Required'),
  });

  const intialValues = {
    title: '',
    topic: '',
  };

  const onSubmit = async (values: any, { resetForm }: any) => {
    // If no file and no YouTube return
    if (!fileObject) {
      return;
    }
    setLoading(true);
    setSubmitted(true);
    const noteID = uuidv4();
    const file = fileObject;
    const fileType = file.type.split('/')[0];
    const fileSubType = file.type.split('/')[1]; // define fileSubType here
    let transcription;

    if (fileType === 'application') {
      if (
        fileSubType ===
        'vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        transcription = await loadDocx(file);
      } else if (fileSubType === 'pdf') {
        transcription = await loadPDF(file);
      }
    } else if (fileType === 'video') {
      // If the file is a video, convert it to audio and then send it to sendAudio
      const audioFile = await convertVideoToMp3(file);
      transcription = await sendAudio(audioFile);
    } else {
      transcription = await sendAudio(file);
    }
    await insertPublicNote({
      formikValues: values,
      transcription: transcription,
      noteID: noteID,
    });

    router.push(`/${noteID}`);
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
                        Generate Community Notes
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-200">
                          Upload recordings that will be transcribed and created
                          into notes.
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
                            className="block w-full bg-gray-800 rounded-md border-0 pl-1.5 py-1.5 text-gray-300 shadow-sm ring-1 ring-inset ring-gray-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="e.g. Linear Regression Notes"
                          />
                          {formik.touched.title && formik.errors.title ? (
                            <div className="mt-2 text-red-500 text-sm">
                              {formik.errors.title}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="col-span-6 sm:col-span-4 mt-4">
                        <label
                          htmlFor="input-name"
                          className="block text-sm font-medium leading-6 text-gray-200 text-left items-center"
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
                            name="topic"
                            id="topic"
                            value={formik.values.topic}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            disabled={submitted}
                            className="block w-full bg-gray-800 pl-1.5 rounded-md border-0 py-1.5 text-gray-300 shadow-sm ring-1 ring-inset ring-gray-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="e.g. Lecture recording for Linear Regression"
                          />
                          {formik.touched.topic && formik.errors.topic ? (
                            <div className="mt-2 text-red-500 text-sm">
                              {formik.errors.topic}
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
                  {!loading && <EmptyUpload onFileChange={handleFile} />}
                  <p className="text-xs mt-2 italic text-gray-400">
                    * File Size is limited to 25 MB.
                  </p>
                  <p className="text-xs mt-2 italic text-gray-400">
                    * Only audio and video files are accepted.
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
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
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
                    <div className="w-full text-center mt-3 text-sm font-bold text-gray-200">
                      Extracting Text...this may take a moment.
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
