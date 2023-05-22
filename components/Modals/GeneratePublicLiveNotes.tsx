import { Fragment, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import EmptyUpload from '@/components/EmptyUpload';
import * as Yup from 'yup';
import { supabaseClient } from '@/supabase-client';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import { getYoutubeTranscript, insertPublicNote } from '@/components/api';
import { v4 as uuidv4 } from 'uuid';
import useMediaRecorder from '@wmik/use-media-recorder';
import { FaMicrophone, FaStopCircle } from 'react-icons/fa';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function GeneratePublicLiveNotes(props: Props) {
  const { open, setOpen } = props;
  const cancelButtonRef = useRef(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [audioRecorded, setAudioRecorded] = useState<boolean>(false);
  const [audioDuration, setAudioDuration] = useState<string>('00:00');
  const [finalAudioDuration, setFinalAudioDuration] = useState<string>('00:00');
  const [stopTime, setStopTime] = useState<Date | null>(null);
  const [audioFile, setAudioFile] = useState<Blob | null>(null);

  const [loading, setLoading] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const router = useRouter();

  const handleClose = () => {
    if (loading) return;
    setAudioFile(null);
    setAudioRecorded(false);
    setAudioDuration('00:00');

    setOpen(false);
    setLoading(false);
    setSubmitted(false); // Add this line
    formik.resetForm();
  };
  const { status, startRecording, stopRecording, mediaBlob, clearMediaBlob } =
    useMediaRecorder({
      mediaStreamConstraints: { audio: true },
      onStop: (blob: Blob) => {
        setAudioFile(blob);
        clearMediaBlob();
        setAudioRecorded(true);
        const now = new Date();
        setStopTime(now);
        if (startTime) {
          const differenceInSeconds = Math.floor(
            (now.getTime() - startTime.getTime()) / 1000,
          );
          const minutes = Math.floor(differenceInSeconds / 60)
            .toString()
            .padStart(2, '0');
          const seconds = (differenceInSeconds % 60)
            .toString()
            .padStart(2, '0');
          setAudioDuration(`${minutes}:${seconds}`);
        }
      },
    });

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
      return transcription;
    } catch (error: any) {
      console.log(JSON.stringify(error));

      alert(`Error: ${error.message}`);
    }
  };

  const handleStartStopRecording = async () => {
    if (status === 'idle' || status === 'stopped') {
      startRecording();
      setStartTime(new Date());
    } else if (status === 'recording') {
      await stopRecording();
      setFinalAudioDuration(audioDuration);
      setStartTime(null);
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (startTime) {
      intervalId = setInterval(() => {
        const now = new Date();
        const differenceInSeconds = Math.floor(
          (now.getTime() - startTime.getTime()) / 1000,
        );
        const minutes = Math.floor(differenceInSeconds / 60)
          .toString()
          .padStart(2, '0');
        const seconds = (differenceInSeconds % 60).toString().padStart(2, '0');

        setAudioDuration(`${minutes}:${seconds}`);
      }, 1000);
    } else {
      setAudioDuration('00:00');
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [startTime]);

  //formik validation
  const validationSchema = Yup.object({
    title: Yup.string().required('Required'),
  });

  const intialValues = {
    title: '',
  };
  const onSubmit = async (values: any, { resetForm }: any) => {
    setLoading(true);

    const noteID = uuidv4();
    if (!audioFile) {
      alert('Please upload an audio file');
      return;
    }
    const fileType = audioFile.type;
    console.log(fileType);

    const webmFile = new File([audioFile], fileType, {
      type: fileType,
    });

    const transcription = await sendAudio(webmFile);

    await insertPublicNote({
      formikValues: values,
      transcription: transcription,
      noteID: noteID,
    });

    router.push(`/${noteID}`);

    resetForm();
    setLoading(false);
    setSubmitted(true); // update this state variable after submission
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-black px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                        Record a Note
                      </Dialog.Title>
                      {!audioRecorded && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-200 mb-2">
                            Generate Community Note
                          </p>
                          <button
                            onClick={handleStartStopRecording}
                            type="button"
                            className="mt-2  bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded"
                          >
                            {status === 'recording' ? (
                              <FaStopCircle size={20} />
                            ) : (
                              <FaMicrophone size={20} />
                            )}
                          </button>

                          <p className="text-white font-bold">
                            {audioDuration}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {audioRecorded && (
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
                  )}
                  <ul className="mt-4">
                    {stopTime && (
                      <li className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-200 font-bold p-2 rounded-md bg-purple-950">
                          Date Created: {stopTime.toLocaleTimeString()} on{' '}
                          {stopTime.toLocaleDateString()}
                        </span>
                      </li>
                    )}
                  </ul>
                  <ul className="mt-4">
                    {audioDuration && audioRecorded && (
                      <li className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-200 font-bold bg-red-800 p-2 rounded-md">
                          Recording Length: {finalAudioDuration}
                        </span>
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

function getYoutubeId(url: string): string | null {
  const regex =
    /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/(watch\?v=)?([^&]+)/;
  const matches = url.match(regex);

  return matches ? matches[5] : null;
}
