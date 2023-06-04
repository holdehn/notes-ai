import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { useSession } from '@supabase/auth-helpers-react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import {
  getYoutubeTranscript,
  insertCourse,
  insertNote,
} from '@/components/api';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function CreateCourseModal(props: Props) {
  const { open, setOpen } = props;
  const cancelButtonRef = useRef(null);
  const session = useSession();
  const userID = session?.user?.id;

  const [loading, setLoading] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const router = useRouter();

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setLoading(false);
    setSubmitted(false); // Add this line
    formik.resetForm();
  };

  //formik validation
  const validationSchema = Yup.object({
    title: Yup.string().required('Required'),
    subject: Yup.string().required('Required'),
  });

  const intialValues = {
    title: '',
    subject: '',
  };

  const onSubmit = async (values: any, { resetForm }: any) => {
    setLoading(true);
    const courseID = generateClassCode();

    await insertCourse({
      userID: userID as unknown as string,
      formikValues: values,
      courseID: courseID,
    });

    // router.push(`/courses/${courseID}`);
    router.push(`#TODO-not-implemented`);
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-200 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                        className="text-xl font-bold leading-6 text-black"
                      >
                        Create Course
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-700">
                          Create a course to start automate your grading.
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
                            className="block w-full bg-gray-100 rounded-md border-0 pl-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-500 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="e.g. Fall 2023 Calculus Course "
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
                          Subject:
                        </label>
                        <div className="mt-2">
                          <input
                            type="text"
                            name="subject"
                            id="subject"
                            value={formik.values.subject}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            disabled={submitted}
                            className="block w-full bg-gray-100 rounded-md border-0 pl-1.5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-500 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="e.g. Calculus"
                          />
                          {formik.touched.subject && formik.errors.subject ? (
                            <div className="mt-2 text-red-500 text-sm">
                              {formik.errors.subject}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!loading ? (
                    <div className="mt-8 sm:mt-8 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                      >
                        Create Course
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

function generateClassCode() {
  const p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return [...Array(6)].reduce((a) => a + p[~~(Math.random() * p.length)], '');
}
