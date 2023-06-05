import { Key, useState } from 'react';
import {
  PlusIcon,
  BookOpenIcon,
  ArrowRightIcon,
  PlusSmallIcon as Add,
} from '@heroicons/react/20/solid';
import InviteModal from '@/components/Modals/InviteModal';
import { useRouter } from 'next/router';

interface CardProps {
  title: string;
  subject: string;
  classCode: string;
  color_theme: string;
}

interface ClassCardsProps {
  courses: any;
  setOpen: (open: boolean) => void;
}
export default function ClassCards({ courses, setOpen }: ClassCardsProps) {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
    >
      {courses?.map(
        (course: {
          id: Key | null | undefined;
          title: string;
          subject: string;
          course_id: string;
          color_theme: string;
        }) => (
          <Card
            key={course.id}
            title={course.title}
            subject={course.subject}
            classCode={course.course_id}
            color_theme={course.color_theme}
          />
        ),
      )}
      <li
        onClick={() => setOpen(true)}
        className="relative block w-full rounded-lg bg-gray-50 border-2 border-dashed border-gray-300 p-16 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
      >
        <span className="mt-2 block text-sm font-semibold text-gray-900">
          <PlusIcon
            className="mx-auto h-12 w-12 text-gray-400"
            aria-hidden="true"
          />
          Create a new class
        </span>
      </li>
    </ul>
  );
}

const Card: React.FC<CardProps> = ({
  title,
  subject,
  classCode,
  color_theme,
}) => {
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/courses/${classCode}`);
  };

  return (
    <li className={`flex flex-col shadow-lg rounded-lg overflow-hidden`}>
      <div className="flex-1 bg-white p-6 flex flex-col justify-between">
        <button onClick={handleNavigate} className="bg-transparent">
          <div className="flex-1">
            <div className="block mt-2">
              <p className="text-lg font-bold text-gray-900">{title}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <div className="flex-shrink-0">
              <BookOpenIcon
                className="h-6 w-6 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">{subject}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">{classCode}</p>
          </div>
        </button>
        <div className="justify-center flex">
          <div className="border-t border-gray-200 p-4 mt-4 justify-center">
            <div className="flex justify-end">
              <button
                onClick={() => setOpenInviteModal(true)}
                className="inline-flex items-center px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-purple-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Invite
                <PlusIcon className="ml-1 -mr-0.5 h-4 w-4" aria-hidden="true" />
              </button>
              <InviteModal
                open={openInviteModal}
                setOpen={setOpenInviteModal}
                inviteUrl={`https://automark.vercel.app/join-classroom?classCode=${classCode}`}
              />
              <button
                onClick={() => handleNavigate()}
                className="inline-flex ml-2 items-center px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-blue-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Class
              </button>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
