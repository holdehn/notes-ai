import { PlusIcon } from '@heroicons/react/20/solid';

interface Props {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export default function EmptyUpload({ onFileChange }: Props) {
  return (
    <div
      className="text-center cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 mt-4"
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input
        type="file"
        id="file-upload"
        hidden
        onChange={onFileChange}
        multiple
        accept="audio/*,video/*,application/pdf" // Accept audio, video, and PDF files
      />

      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>

        <p className="mt-1 text-sm text-gray-500">
          Click to upload a context file.
        </p>
      </div>
    </div>
  );
}
