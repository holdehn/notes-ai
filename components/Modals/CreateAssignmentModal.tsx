import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import EmptyUpload3 from './EmptyUpload3';
import { useSession } from '@supabase/auth-helpers-react';
import * as Yup from 'yup';
import { supabaseClient } from '@/supabase-client';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { insertAssignment, loadLatex } from '../api';
import DueDatePicker from '../ui/components/DatePicker';
import { DateValueType } from 'react-tailwindcss-datepicker/dist/types';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  courseID: string;
}

interface FileDisplay {
  file: File;
  id: number;
}

export default function CreateAssignmentModal(props: Props) {
  const { open, setOpen, courseID } = props;
  const session = useSession();
  const userID = session?.user?.id;
  const cancelButtonRef = useRef(null);
  const [files, setFiles] = useState<FileDisplay | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [nextId, setNextId] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [value, setValue] = useState<DateValueType>({
    startDate: new Date(),
    endDate: new Date(),
  });
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

      // Check if the file is not an image or PDF
      if (fileType !== 'image' && fileType !== 'application') {
        alert('File type not supported');
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
    setValue(null);
  };

  //formik validation
  const validationSchema = Yup.object({
    title: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
    startDate: Yup.date().required('Required'),
    dueDate: Yup.date().required('Required'),
  });

  const intialValues = {
    title: '',
    description: '',
    dueDate: '',
    startDate: '',
  };

  const onSubmit = async (values: any, { resetForm }: any) => {
    // If no file and no YouTube return

    if (!fileObject) {
      return;
    }

    if (!userID) return;
    setLoading(true);
    setSubmitted(true);
    const assignmentID = uuidv4();
    const file = fileObject;
    const fileID = uuidv4();
    const response = await loadLatex({ file, fileID });
    const content = response.data;
    console.log(content);

    const { error: insertError } = await insertAssignment({
      userID: userID,
      formikValues: values,
      assignmentID: assignmentID,
      content: content,
      fileID: fileID,
      courseID: courseID as string,
    });
    console.log(insertError);

    router.push(`/courses/${courseID as string}/assignment/${assignmentID}`);
    setFiles(null);
    setName('');
    setFileObject(null);
    resetForm();
    setLoading(false);
    setOpen(false);
    setSubmitted(false);
  };

  const formik = useFormik({
    initialValues: intialValues,
    validationSchema: validationSchema,
    onSubmit,
  });

  const onDateChange = (value: DateValueType) => {
    if (!value) return;
    setValue(value);
    formik.setFieldValue('dueDate', value?.endDate);
    formik.setFieldValue('startDate', value?.startDate);
  };

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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg  bg-gray-200 px-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                        className="text-xl font-bold leading-6 text-gray-950"
                      >
                        Create Assignment
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-800">
                          Upload rubric template to provide instantly grade work
                          and provide feedback.
                        </p>
                      </div>
                      <div className="col-span-6 sm:col-span-4 mt-4">
                        <label
                          htmlFor="input-name"
                          className="block text-sm font-medium leading-6 text-gray-900 text-left"
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
                            className="block w-full bg-gray-200 rounded-md border-0 pl-1.5 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="e.g. Linear Regression Worksheet"
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
                          className="block text-sm font-medium leading-6 text-gray-900 text-left"
                        >
                          Description:
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="description"
                            id="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            disabled={submitted}
                            className="block w-full row-span-4 bg-gray-200 pl-1.5 rounded-md border-0 py-1.5 text-gray-800 shadow-sm ring-1 ring-inset ring-gray-500 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="e.g. Assignment Description"
                          />
                          {formik.touched.description &&
                          formik.errors.description ? (
                            <div className="mt-2 text-red-500 text-sm">
                              {formik.errors.description}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex justify-between mt-4">
                        <div className="w-1/2 pr-2">
                          <label
                            htmlFor="input-name"
                            className="block text-sm font-medium leading-6 text-gray-900 text-left"
                          >
                            Due Date:
                          </label>
                          <DueDatePicker
                            onDueDateChange={onDateChange}
                            date={value}
                          />
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-sm text-gray-800 font-medium text-left mt-8 block items-center">
                          Upload Model Answers:
                          <span className="ml-2 text-gray-800 hover:text-gray-800 cursor-pointer">
                            <i
                              className="fas fa-question-circle"
                              title="Upload any relevant documents that will help the tool perform its function."
                            ></i>
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  {!loading && <EmptyUpload3 onFileChange={handleFile} />}
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
                        Create Assignment
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
