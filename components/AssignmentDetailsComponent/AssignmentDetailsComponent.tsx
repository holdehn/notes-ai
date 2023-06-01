import { Fragment, useState } from 'react';
import { Dialog, Menu, Transition } from '@headlessui/react';
import {
  Bars3CenterLeftIcon,
  XMarkIcon,
  NewspaperIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useSession } from '@supabase/auth-helpers-react';
import {
  HomeIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/20/solid';
import useSWR from 'swr';
import { ChevronLeftIcon, UserIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/router';
import SelectionModal from '../Modals/SelectionModal';
import PdfViewer from '../PdfViewer';
import { updateAssignmentData, upsertAssignmentData } from '../api';
import SuccessModal from '../ui/SuccessModal';
import { set } from 'date-fns';

export default function AssignmentDetailsComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const session = useSession();
  const user_id = session?.user?.id;
  const router = useRouter();
  const assignmentID = router.query.assignmentID as unknown as string;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalType, setModalType] = useState<string>('question');
  const [showQuestionDetails, setShowQuestionDetails] =
    useState<boolean>(false);
  const [selectedQuestionDetails, setSelectedQuestionDetails] = useState<{
    questionNumber: number;
    question: string;
    solution: string;
    feedback?: string;
  } | null>({ questionNumber: 1, question: '', solution: '' });

  // Initializing new states for editing control
  const [isEditingSolution, setIsEditingSolution] = useState<boolean>(false);
  const [isEditingFeedback, setIsEditingFeedback] = useState<boolean>(false);

  // Do the same for feedback
  const saveFeedbackChanges = async () => {
    // Get the new feedback text from the contentEditable div
    const newFeedback =
      document.getElementById('feedback-text')?.innerText || '';
    if (selectedQuestionDetails && selectedQuestionDetails.question) {
      setSelectedQuestionDetails({
        question: selectedQuestionDetails.question,
        questionNumber: selectedQuestionDetails.questionNumber,
        solution: selectedQuestionDetails.solution,
        feedback: newFeedback,
      });
      setIsEditingFeedback(false);
      const data = {
        userID: user_id || '',
        text: newFeedback,
        type: 'feedback',
        assignmentID: assignmentID,
        questionNumber: selectedQuestionDetails.questionNumber,
      };
      await updateAssignmentData(data);
    }
  };

  const [isTextSelected, setIsTextSelected] = useState(false);

  // Handler for mouse up event
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection) {
      const selectedText = selection.toString().trim();
      setIsTextSelected(!!selectedText);
      setSelectedText(selectedText);
    }
  };

  // Handler for closing the modal
  const closeModal = () => {
    // Clear selected text when the modal is closed
    setSelectedText('');
    setIsTextSelected(false);
  };

  const name = session?.user?.user_metadata?.full_name;
  const avatar_url = session?.user?.user_metadata?.avatar_url;
  const proxyUrl = '/api/proxy?imageUrl=';
  const finalImageUrl = proxyUrl + encodeURIComponent(avatar_url);

  // Your existing fetcher function
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    const data = await response.json();

    if (data.assignment) {
      return { ...data, ...data.assignment };
    }
    return data;
  };

  // Your existing SWR hook
  const {
    data: assignmentData,
    error: assignmentError,
    mutate: mutateAssignmentData,
  } = useSWR(
    user_id && assignmentID
      ? `/api/get-assignment-data?assignmentID=${assignmentID}&userID=${user_id}`
      : null,
    fetcher,
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  if (!assignmentData) {
    return <div>Loading...</div>;
  }
  console.log('assignmentData', assignmentData);

  const { assignment, signedUrl, questions, solutions } = assignmentData;

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    });

    router.push('/');
  };
  const title = assignment?.title;
  const proxyPdfUrl = '/api/proxy?pdfUrl=';
  const finalPdfUrl =
    proxyPdfUrl +
    encodeURIComponent(signedUrl) +
    '&title=' +
    encodeURIComponent(title);

  const addQuestionOrSolution = async (type: string) => {
    const data = {
      assignmentID: assignmentID,
      userID: user_id || '',
      type: type,
      text: selectedText || '',
    };
    setIsTextSelected(false);
    const updatedData = await upsertAssignmentData(data);

    // After a successful update, mutate the SWR cache
    // After a successful update, mutate the SWR cache
    if (updatedData) {
      const newData = { ...assignmentData };

      // Check the type and add the new entry to the appropriate array
      if (type === 'question') {
        if (newData.questions === null) {
          newData.questions = [];
        }
        newData.questions.push(selectedText);
      } else if (type === 'solution') {
        if (newData.solutions === null) {
          newData.solutions = [];
        }
        newData.solutions.push(selectedText);
      }
      setModalType(type);
      setShowSuccessModal(true);
      mutateAssignmentData(newData, false);
      setSelectedText('');
    }
  };

  const openQuestionDetails = (selectedQuestion: {
    questionNumber: number;
    question: string;
    solution: string;
  }) => {
    setSelectedQuestionDetails(selectedQuestion);
    setShowQuestionDetails(true);
  };

  const closeQuestionDetails = () => {
    setShowQuestionDetails(false);
  };
  const saveSolutionChanges = async () => {
    // Get the new solution text from the contentEditable div
    const newSolution =
      document.getElementById('solution-text')?.innerText || '';
    if (selectedQuestionDetails && selectedQuestionDetails.question) {
      setSelectedQuestionDetails({
        question: selectedQuestionDetails.question,
        questionNumber: selectedQuestionDetails.questionNumber,
        solution: newSolution,
        feedback: selectedQuestionDetails.feedback,
      });
      const data = {
        userID: user_id || '',
        text: newSolution,
        type: 'solutions',
        assignmentID: assignmentID,
        questionNumber: selectedQuestionDetails.questionNumber,
      };
      const response = await updateAssignmentData(data); // This is now a Response object
      const updatedData = await response.json(); // This is now the data from the response

      // After a successful update, mutate the SWR cache
      // After a successful update, mutate the SWR cache
      if (updatedData && updatedData[0]) {
        const newData = { ...assignmentData };

        // Check if solutions exist in the response
        if (updatedData[0].solutions) {
          newData.solutions = [...updatedData[0].solutions]; // Spread to create a new array
        } else {
          // If solutions do not exist in the response, create an empty array or add a default solution
          newData.solutions = [];
          // Or add the newSolution as the first solution
          newData.solutions.push(newSolution);
        }

        console.log('newData after update:', newData); // Add this line
        mutateAssignmentData(newData, false);

        // Now we set the editing state to false
        setIsEditingSolution(false);
      }
    }
  };

  return (
    <>
      <div className="min-h-screen">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 md:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pb-4 pt-5">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute right-0 top-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* <div className="flex flex-shrink-0 items-center px-4">
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=purple&shade=500"
                      alt="NotesAI Logo"
                    />
                  </div> */}
                  <div className="mt-5 h-0 flex-1 overflow-y-auto">
                    <nav className="px-2">
                      <div className="space-y-1">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                              'group flex items-center rounded-md px-2 py-2 text-base font-medium leading-5',
                            )}
                            aria-current={item.current ? 'page' : undefined}
                          >
                            <item.icon
                              className={classNames(
                                item.current
                                  ? 'text-gray-500'
                                  : 'text-gray-400 group-hover:text-gray-500',
                                'mr-3 h-6 w-6 flex-shrink-0',
                              )}
                              aria-hidden="true"
                            />
                            {item.name}
                          </a>
                        ))}
                      </div>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-400 bg-black lg:pb-4 lg:pt-5">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="mt-5 flex h-0 flex-1 flex-col overflow-y-auto pt-1">
            {/* User account dropdown */}
            <Menu as="div" className="relative inline-block px-3 text-left">
              <div>
                <Menu.Button className="group w-full rounded-md from-indigo-950 to-indigo-900 px-3.5 py-2 text-left text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-indigo-800">
                  <span className="flex w-full items-center justify-between">
                    <span className="flex min-w-0 items-center justify-between space-x-3">
                      {finalImageUrl ? (
                        <img
                          src={finalImageUrl}
                          className="flex-shrink-0 h-10 w-10 rounded-full"
                          alt={name}
                        />
                      ) : (
                        <UserIcon
                          className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"
                          aria-hidden="true"
                        />
                      )}

                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-white">
                          {name}
                        </span>
                      </span>
                    </span>
                    <ChevronUpDownIcon
                      className="h-5 w-5 flex-shrink-0 text-white group-hover:text-indigo-200"
                      aria-hidden="true"
                    />
                  </span>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-0 right-0 z-10 mx-3 mt-1 origin-top divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
                            'block px-4 py-2 text-sm',
                          )}
                        >
                          View profile
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
                            'block px-4 py-2 text-sm',
                          )}
                        >
                          Settings
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
                            'block px-4 py-2 text-sm',
                          )}
                        >
                          Notifications
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
                            'block px-4 py-2 text-sm',
                          )}
                        >
                          Get desktop app
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
                            'block px-4 py-2 text-sm',
                          )}
                        >
                          Support
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={classNames(
                            active
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700',
                            'block px-4 py-2 text-sm',
                          )}
                        >
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            {/* Sidebar Search */}
            <div className="mt-5 px-3">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
                  aria-hidden="true"
                >
                  <MagnifyingGlassIcon
                    className="h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="block w-full rounded-md border-0 py-1.5 pl-9 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Search"
                />
              </div>
            </div>
            {/* Navigation */}
            <nav className="mt-6 px-3">
              <div className="space-y-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-indigo-700 text-white'
                        : 'text-white hover:bg-indigo-700 hover:text-white',
                      'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    <item.icon
                      className={classNames(
                        item.current
                          ? 'text-white'
                          : 'text-indigo-300 group-hover:text-white',
                        'mr-3 h-6 w-6 flex-shrink-0',
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        </div>
        {/* Main column */}
        <div className="flex flex-col lg:pl-64">
          {/* Search header */}
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white lg:hidden">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3CenterLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex flex-1">
                <form className="flex w-full md:ml-0" action="#" method="GET">
                  <label htmlFor="search-field" className="sr-only">
                    Search
                  </label>
                  <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                      <MagnifyingGlassIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="search-field"
                      name="search-field"
                      className="block h-full w-full border-transparent py-2 pl-8 pr-3 text-gray-900 focus:border-transparent focus:outline-none focus:ring-0 focus:placeholder:text-gray-400 sm:text-sm"
                      placeholder="Search"
                      type="search"
                    />
                  </div>
                </form>
              </div>
              <div className="flex items-center">
                {/* Profile dropdown */}
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"></Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-gray-200 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-700',
                                'block px-4 py-2 text-sm',
                              )}
                            >
                              View profile
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-700',
                                'block px-4 py-2 text-sm',
                              )}
                            >
                              Settings
                            </a>
                          )}
                        </Menu.Item>
                      </div>

                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active
                                  ? 'bg-gray-100 text-gray-900'
                                  : 'text-gray-700',
                                'block px-4 py-2 text-sm',
                              )}
                            >
                              Logout
                            </a>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>
          <main className="lg:pr-96 bg-indigo-950 relative min-w-screen">
            <PdfViewer url={finalPdfUrl} onMouseUp={handleMouseUp} />

            <SelectionModal
              open={isTextSelected}
              setOpen={setIsTextSelected}
              assignmentID={assignmentID}
              selectedText={selectedText}
              setSelectedText={setSelectedText}
              userID={user_id}
              closeModal={closeModal}
              addQuestionOrSolution={addQuestionOrSolution}
            />
            {showSuccessModal && <SuccessModal type={modalType} />}
          </main>

          <>
            {!showQuestionDetails ? (
              // Question List Sidebar
              <aside className="fixed top-0 right-0 w-96 overflow-y-auto border-l border-white/5 h-full bg-indigo-950">
                <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 bg-black">
                  <h2 className="text-base font-semibold leading-7 text-white">
                    {title}
                  </h2>
                  <a
                    href="#"
                    className="text-sm font-semibold leading-6 text-indigo-400"
                  >
                    Solution
                  </a>
                </header>
                <ul className="divide-y divide-white/10 overflow-y-auto">
                  {questions && questions.length > 0 ? (
                    questions.map((item: string, index: number) => (
                      <li key={index}>
                        <div
                          className="group relative flex items-center px-4 py-4 sm:px-6 bg-indigo-700 hover:bg-indigo-800 hover:cursor-pointer hover:text-white justify-between"
                          onClick={() =>
                            openQuestionDetails({
                              questionNumber: index + 1,
                              question: item,
                              solution:
                                solutions && solutions.length > index
                                  ? solutions[index]
                                  : null,
                            })
                          }
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500">
                                <span className="text-sm font-medium leading-none text-white">
                                  Q{index + 1}
                                </span>
                              </span>
                            </div>
                            <p className="text-sm font-bold ml-4 text-white truncate-multiline">
                              Question:
                              <br />
                              <span className="text-sm font-medium text-white truncate-multiline">
                                {item}
                              </span>
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <ChevronRightIcon
                              className="h-5 w-5 text-white"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      </li>
                    ))
                  ) : (
                    <div className="px-4 py-6 sm:px-6">
                      <p className="text-md text-center font-medium truncate text-white">
                        <em>No questions found</em>
                      </p>
                    </div>
                  )}
                </ul>
              </aside>
            ) : (
              // Question Details Sidebar
              <aside className="fixed top-0 right-0 w-96 overflow-y-auto border-l border-white/5 h-full bg-indigo-950">
                <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 bg-black">
                  <button
                    onClick={() => {
                      closeQuestionDetails();
                      setIsEditingSolution(false);
                      setIsEditingFeedback(false);
                    }}
                  >
                    <ChevronLeftIcon
                      className="h-5 w-5 bg-white rounded-full hover:bg-gray-200"
                      aria-hidden="true"
                    />
                  </button>
                  <h2 className="text-base font-semibold leading-7 text-white">
                    Question {selectedQuestionDetails?.questionNumber}
                  </h2>
                </header>
                <div className="px-4 py-4">
                  <h3 className="text-lg font-semibold text-white">Question</h3>
                  <div className="box bg-white text-black mt-2 p-4 rounded-lg">
                    <p className="text-sm">
                      {selectedQuestionDetails?.question}
                    </p>
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-4">
                    Solution
                  </h3>
                  <div className="box bg-gray-200 text-black mt-2 p-4 rounded-lg">
                    {isEditingSolution ? (
                      <div
                        id="solution-text"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={saveSolutionChanges}
                      >
                        {selectedQuestionDetails?.solution}
                      </div>
                    ) : (
                      <p className="text-sm">
                        {selectedQuestionDetails?.solution}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (isEditingSolution) {
                        saveSolutionChanges();
                      }
                      setIsEditingSolution(!isEditingSolution);
                    }}
                    className={`mt-2 py-1 px-2 rounded text-white ${
                      isEditingSolution
                        ? 'bg-green-500 hover:bg-green-700'
                        : 'bg-indigo-500 hover:bg-indigo-700'
                    }`}
                  >
                    {isEditingSolution ? 'Save' : 'Edit'}
                  </button>

                  {/* Add Feedback Section */}
                  <h3 className="text-lg font-semibold text-white mt-4">
                    Feedback
                  </h3>
                  <div className="box bg-gray-200 text-black mt-2 p-4 rounded-lg">
                    {isEditingFeedback ? (
                      <div
                        id="feedback-text"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={saveFeedbackChanges}
                      >
                        {selectedQuestionDetails?.feedback}
                      </div>
                    ) : (
                      <p className="text-sm">
                        {selectedQuestionDetails?.feedback}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (isEditingFeedback) {
                        saveFeedbackChanges();
                      }
                      setIsEditingFeedback(!isEditingFeedback);
                    }}
                    className="mt-2 py-1 px-2 rounded bg-indigo-500 text-white hover:bg-indigo-700"
                  >
                    {isEditingFeedback ? 'Save' : 'Edit'}
                  </button>
                </div>
              </aside>
            )}
          </>
        </div>
      </div>
    </>
  );
}

const navigation = [
  {
    name: 'Home',
    href: '/home',
    icon: HomeIcon,
    current: false,
  },
  {
    name: 'Automated Grading',
    href: '/grading',
    icon: PencilSquareIcon,
    current: true,
  },
  {
    name: 'My Notes',
    href: '/my-notes',
    icon: NewspaperIcon,
    current: false,
  },
];
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
