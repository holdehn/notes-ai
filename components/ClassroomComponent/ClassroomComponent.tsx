import { Fragment, useState } from 'react';
import {
  PlusIcon,
  BookOpenIcon,
  ArrowRightIcon,
  PlusSmallIcon as Add,
} from '@heroicons/react/20/solid';
import { Session, useSession } from '@supabase/auth-helpers-react';

import useSWR from 'swr';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { HomeIcon, NewspaperIcon } from '@heroicons/react/20/solid';

import { useRouter } from 'next/router';

import CreateAssignmentModal from '../Modals/CreateAssignmentModal';
import ClassroomSidebar from '../ui/Sidebars/ClassroomSidebar';
import Divider from '../ui/components/Divider';
import InviteModal from '../Modals/InviteModal';

export default function ClassroomComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const router = useRouter();

  const session: Session | null = useSession();
  const userID = session?.user?.id;
  const courseID = router.query.courseID as string;
  const [openInviteModal, setOpenInviteModal] = useState(false);

  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data, error } = useSWR(
    userID ? `/api/get-course?userID=${userID}&courseID=${courseID}` : null,
    fetcher,
  );

  console.log(data);

  const title = data?.courseData[0]?.title;
  const description = data?.courseData[0]?.description;
  const subject = data?.courseData[0]?.subject;

  const name = session?.user?.user_metadata?.full_name;
  const avatar_url = session?.user?.user_metadata?.avatar_url;

  const proxyUrl = '/api/proxy?imageUrl=';

  const finalImageUrl = proxyUrl + encodeURIComponent(avatar_url);

  return (
    <>
      <div className="min-h-screen">
        <ClassroomSidebar
          avatar={finalImageUrl}
          courseID={courseID}
          name={name}
          title={title}
          subject={subject}
        />
        <main className="lg:ml-72">
          <div className="bg-gray-100 relative min-h-screen">
            <div className="p-10 sm:pb-32">
              <div className="max-w-full">
                <div className="flex-1 bg-white p-6 flex flex-col justify-between rounded-md">
                  <div className="flex-1">
                    <div className="block mt-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {title}
                      </p>
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
                      <p className="text-sm font-medium text-gray-600">
                        {subject}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500">{courseID}</p>
                  </div>
                  <div className={`border-b border-gray-200 mt-3 mb-3`}>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setOpenInviteModal(true)}
                        className="inline-flex items-center px-3 py-1 mb-3 rounded-full bg-purple-500 text-white text-sm font-semibold shadow-sm ring-1 ring-inset ring-purple-300 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Invite to Class
                      </button>
                      <InviteModal
                        open={openInviteModal}
                        setOpen={setOpenInviteModal}
                        inviteUrl={`https://automark.vercel.app/join-classroom?classCode=${courseID}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <CreateAssignmentModal open={openModal} setOpen={setOpenModal} />
    </>
  );
}
