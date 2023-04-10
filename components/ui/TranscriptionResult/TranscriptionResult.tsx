import React from 'react';

interface TranscriptionResultProps {
  transcription: string;
}

const TranscriptionResult: React.FC<TranscriptionResultProps> = ({
  transcription,
}) => {
  return (
    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Transcription Result:</h3>
      <p className="text-gray-600 whitespace-pre-wrap">{transcription}</p>
    </div>
  );
};

export default TranscriptionResult;
