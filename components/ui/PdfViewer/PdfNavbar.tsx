import { useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { PlusIcon } from '@heroicons/react/20/solid';
import AddResponseSection from '@/components/Modals/AddResponseSection';

interface Props {
  onClickAddSolutionSection: () => void;
}

export default function PdfNavbar(props: Props) {
  const { onClickAddSolutionSection } = props;
  const [isAddingSolution, setIsAddingSolution] = useState(false);

  const handleClick = () => {
    setIsAddingSolution(!isAddingSolution);
    onClickAddSolutionSection();
  };

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleClick}
                    className={`relative inline-flex items-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold shadow-sm text-white ${
                      isAddingSolution ? 'bg-indigo-400' : 'bg-indigo-500'
                    } hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`}
                  >
                    <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                    Add Question
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
}
