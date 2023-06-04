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
import PdfViewer from '../ui/PdfViewer/PdfViewer';
import { updateAssignmentData, upsertAssignmentData } from '../api';
import SuccessModal from '../ui/SuccessModal';
import { set } from 'date-fns';
import AssignmentDetailSidebar from '../ui/Sidebars/AssignmentDetailSidebar';

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
  const [canDrawBox, setCanDrawBox] = useState(false); // Added line

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
  const onMouseUp = () => {
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
  const finalAvatarUrl = proxyUrl + encodeURIComponent(avatar_url);

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
        <AssignmentDetailSidebar avatar={finalAvatarUrl} />
        <div className="flex flex-col lg:pl-20">
          <main className="lg:pr-100 bg-indigo-950">
            <PdfViewer
              url={finalPdfUrl}
              onMouseUp={onMouseUp}
              canDrawBox={canDrawBox}
            />

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
              <aside className="fixed top-0 right-0 lg:w-112 overflow-y-auto border-l border-white/5 h-full bg-indigo-950">
                <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 bg-black">
                  <h2 className="text-base font-semibold leading-7 text-white">
                    {title}
                  </h2>
                  <a
                    href="#TODO-implement"
                    className="text-sm font-semibold leading-6 text-indigo-400"
                  >
                    Upload
                  </a>
                </header>
                <ul className="divide-y divide-white/10 overflow-y-auto">
                  {questions && questions.length > 0 ? (
                    questions.map((item: string, index: number) => (
                      <li key={index}>
                        <div
                          className="group relative flex items-center px-4 py-4 sm:px-6 bg-gray-100 hover:bg-gray-400 hover:cursor-pointer hover:text-black justify-between"
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
                            <span className="text-sm ml-4 font-medium text-gray-950 truncate-multiline">
                              {item}
                            </span>
                          </div>
                          <div className="flex-shrink-0">
                            <ChevronRightIcon
                              className="h-5 w-5 ml-2 text-purple-800"
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
              <aside className="fixed top-0 right-0 w-112 overflow-y-auto border-l border-white/5 h-full bg-indigo-950">
                <header className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 bg-black">
                  <button
                    onClick={() => {
                      closeQuestionDetails();
                      setIsEditingSolution(false);
                      setIsEditingFeedback(false);
                    }}
                  >
                    <ChevronLeftIcon
                      className="h-5 w-5 bg-gray-300 rounded-full hover:bg-gray-400"
                      aria-hidden="true"
                    />
                  </button>
                  <h2 className="text-base font-semibold leading-7 text-white">
                    Question {selectedQuestionDetails?.questionNumber}
                  </h2>
                </header>
                <div className="px-4 py-4">
                  <h3 className="text-lg font-semibold text-white">Question</h3>
                  <div className="box bg-gray-300 text-black mt-2 p-4 rounded-lg">
                    <p className="text-sm">
                      {selectedQuestionDetails?.question}
                    </p>
                  </div>
                  <h3 className="text-lg font-semibold text-white mt-4">
                    Solution
                  </h3>
                  <div className="box bg-gray-300 text-black mt-2 p-4 rounded-lg">
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
    href: '/courses',
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
