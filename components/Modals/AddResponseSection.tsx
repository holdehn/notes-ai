import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import * as Yup from 'yup';
import { supabaseClient } from '@/supabase-client';
import { useFormik } from 'formik';
import { useRouter } from 'next/router';
import { insertResponseSection } from '@/components/api';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  userID: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function AddResponseSection(props: Props) {
  const { open, setOpen, x1, x2, y1, y2, userID } = props;
  const cancelButtonRef = useRef(null);

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
  });

  const intialValues = {
    title: '',
  };
  const onSubmit = async (values: any, { resetForm }: any) => {
    setLoading(true);
    const sectionID = uuidv4();

    await insertResponseSection({
      formikValues: values,
      sectionID: sectionID,
      userID: userID,
      coordinates: {
        x1: x1,
        y1: y1,
        x2: x2,

        y2: y2,
      },
    });
    setOpen(false);

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
                        Add Response Section
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
                    </div>
                  </div>

                  <div className="mt-8 sm:mt-8 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    >
                      Add Section
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
