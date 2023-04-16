// components/LiveTranscription.tsx
import { useEffect, useState } from 'react';

interface LiveTranscriptionProps {
  onStartSession: () => void;
  onStopSession: () => void;
  isSessionActive: boolean;
  sessionTime: number;
  setSessionTime: any;
}

const LiveTranscription: React.FC<LiveTranscriptionProps> = ({
  onStartSession,
  onStopSession,
  isSessionActive,
  setSessionTime,
  sessionTime,
}) => {
  const formattedTime = new Date(sessionTime * 1000)
    .toISOString()
    .substr(11, 8);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (isSessionActive) {
      timer = setInterval(() => {
        setSessionTime((prevTime: number) => prevTime + 1);
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isSessionActive]);

  return (
    <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        Select Agent
      </button>
      {isSessionActive ? (
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          onClick={onStopSession}
        >
          Stop Session ({formattedTime})
        </button>
      ) : (
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          onClick={onStartSession}
        >
          Start Session
        </button>
      )}
    </div>
  );
};

export default LiveTranscription;
