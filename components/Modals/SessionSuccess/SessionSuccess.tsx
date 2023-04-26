import { Dispatch, Fragment, SetStateAction, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { supabaseClient } from '@/supabase-client';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useRouter } from 'next/router';

interface SessionSuccessProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  sessionID: string;
}

const SessionSuccess: React.FC<SessionSuccessProps> = ({
  open,
  setOpen,
  sessionID,
}) => {
  const router = useRouter();
  const initialSessionName = `Session ${new Date().toLocaleDateString()}`;
  const initialValues = {
    sessionName: initialSessionName,
  };
  const onSubmit = async (values: any) => {
    const { data, error } = await supabaseClient
      .from('live_sessions')
      .update({ session_name: values.sessionName })
      .eq('id', sessionID);
    if (error) {
      console.log(error);
    }
    if (data) {
      console.log(data);
    }
    router.push(`/live-assistant/${sessionID}`);
  };

  const formik = useFormik({
    initialValues,
    onSubmit,
  });

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
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
        <form onSubmit={formik.handleSubmit}>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckIcon
                        className="h-6 w-6 text-green-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Session saved successfully!
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Please enter a name for your session.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label
                      htmlFor="sessionName"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Name for session
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="sessionName"
                        id="sessionName"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder="Enter session name"
                      />
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Continue
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </form>
      </Dialog>
    </Transition.Root>
  );
};

export default SessionSuccess;
