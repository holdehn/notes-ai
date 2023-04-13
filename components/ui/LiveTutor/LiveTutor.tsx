// LiveTutor.tsx
import React, {
  useState,
  useEffect,
  useRef,
  Dispatch,
  SetStateAction,
} from 'react';

interface Props {
  setIsRecording: Dispatch<SetStateAction<boolean>>;
}

const LiveTutor: React.FC<Props> = () => {
  const [recording, setRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection when the component mounts
    const socket = new WebSocket(
      `ws://${window.location.host}/api/live-transcription`,
    );
    setWs(socket);

    return () => {
      // Close WebSocket connection when the component unmounts
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setTranscription(
          (prevTranscription) =>
            prevTranscription + data.alternatives[0].transcript,
        );
      };
    }
  }, [ws]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0 && ws && ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              audioChunk: event.data,
              audioFormat: 'audio/webm',
            }),
          );
        }
      };

      mediaRecorder.current.start();
      setRecording(true);
    } catch (error) {
      console.error('Error starting the recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="lg:flex lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
          {/* Add other information sections here */}
        </div>
      </div>
      <div className="mt-5 flex lg:ml-4 lg:mt-0">
        <span className="sm:ml-3">
          <button
            type="button"
            onClick={toggleRecording}
            className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            {recording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </span>
      </div>
      {transcription && (
        <div className="mt-5">
          <textarea
            value={transcription}
            readOnly
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      )}
    </div>
  );
};

export default LiveTutor;
