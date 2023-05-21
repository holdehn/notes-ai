import { KeyedMutator } from 'swr';
import {
  CreateNoteParams,
  CreateNoteResponse,
  CreateNotesSummaryParams,
  CreateNotesFactsParams,
  NoteSummary,
  Result,
  CreatePublicNoteParams,
  CreatePublicNotesParams,
  InsertExtractedTextParams,
} from './types';
import { fetchEventSource } from '@microsoft/fetch-event-source';

const insertNote = async (
  params: CreateNoteParams,
): Promise<CreateNoteResponse> => {
  const response = await fetch('/api/create-note-supabase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  return data;
};

const insertPublicNote = async (
  params: CreatePublicNoteParams,
): Promise<CreateNoteResponse> => {
  const response = await fetch('/api/create-public-note-supabase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  return data;
};

/**
 * Updates the summary of a note.
 *
 */
const sendSummaryToSupabase = async ({
  summary,
  noteId,
  userId,
}: {
  summary: string;
  noteId: string;
  userId: string;
}) => {
  try {
    const response = await fetch('/api/update-note-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        noteId,
        userId,
        summary,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }

    const data = await response.json();
  } catch (error) {
    console.error('Error updating summary:', error);
  }
};
const sendNotesToSupabase = async ({
  notes,
  noteId,
  userId,
}: {
  notes: string[];
  noteId: string;
  userId: string;
}) => {
  try {
    const response = await fetch('/api/update-note-facts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        noteId,
        userId,
        notes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }

    const data = await response.json();
  } catch (error) {
    console.error('Error updating notes:', error);
  }
};

/**
 * Creates a stream of a summary of the notes.
 * @param params Params for this request
 * @param messageCallback Callback as additional data is received
 */
const createNotesSummary = async (
  {
    transcription,
    userId,
    noteId,
    name,
    topic,
    type,
  }: CreateNotesSummaryParams,
  messageCallback: (message: string) => void,
): Promise<void> => {
  let fullSummary = '';

  const wordCount = transcription.split(/\s+/).length; // Get word count

  const summaryUrl =
    wordCount > 1000 // If word count is over 1500 use long-summary
      ? `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/create-long-summary`
      : `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/create-summary`;

  // const summaryUrl = `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/create-long-summary`;

  await fetchEventSource(summaryUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      transcription,
      name,
      topic,
      user_id: userId,
      noteId,
    }),
    onmessage(ev) {
      const summaryChunk = ev.data;
      if (summaryChunk === 'END_OF_SUMMARY') {
        sendSummaryToSupabase({
          summary: fullSummary,
          noteId: noteId,
          userId: userId,
        });
        // mutate(`/api/get-note-summary?noteId=${noteId}&userId=${userId}`);
      } else {
        fullSummary += summaryChunk;
        messageCallback(fullSummary);
      }
    },

    onerror(error) {
      console.error('Error in fetchEventSource:', error);
    },
  });
};

const createNotesFacts = async (
  { transcription, userId, noteId, name, topic, type }: CreateNotesFactsParams,
  messageCallback: (messages: string[]) => void,
): Promise<void> => {
  let entireString = '';
  let bulletPoints: string[] = [];
  const wordCount = transcription.split(/\s+/).length; // Get word count
  console.log('wordCount', wordCount);

  const factsUrl =
    wordCount > 1000 // If word count is over 1500 use create-long-notes
      ? `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/create-long-notes`
      : `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/create-facts`;

  // const factsUrl = `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/create-facts`;
  await fetchEventSource(factsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      transcription,
      name,
      topic,
      user_id: userId,
      noteId,
    }),
    onmessage(ev) {
      const chunk = ev.data;
      if (chunk === 'END_OF_SUMMARY') {
        // Separate the entire string into bullet points
        bulletPoints = entireString
          .split('\\n')
          .filter((line) => line.length > 0);
        sendNotesToSupabase({
          notes: bulletPoints,
          noteId: noteId,
          userId: userId,
        });
      } else {
        entireString += chunk;
        const currentBulletPoints = entireString
          .split(/(?: - )|(?:\\n)/)
          .filter((line) => line.trim().length > 0)
          .map((line) => line.trim());
        messageCallback(currentBulletPoints);
      }
    },

    onerror(error) {
      console.error('Error in fetchEventSource:', error);
    },
  });
};

const sendPublicNotesToSupabase = async ({
  notes,
  noteId,
}: {
  notes: string[];
  noteId: string;
}) => {
  try {
    const response = await fetch('/api/update-public-note-facts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        noteId,
        notes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }

    const data = await response.json();
  } catch (error) {
    console.error('Error updating notes:', error);
  }
};

const createPublicNotesFacts = async (
  {
    transcription,
    noteId,

    name,
    topic,
  }: CreatePublicNotesParams,
  messageCallback: (messages: string[]) => void,
): Promise<void> => {
  let entireString = '';
  let bulletPoints: string[] = [];

  await fetchEventSource(
    `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/create-facts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        transcription,
        name,
        topic,
      }),
      onmessage(ev) {
        const chunk = ev.data;
        if (chunk === 'END_OF_SUMMARY') {
          // Separate the entire string into bullet points
          bulletPoints = entireString
            .split('\\n')
            .filter((line) => line.length > 0);

          sendPublicNotesToSupabase({
            notes: bulletPoints,
            noteId: noteId,
          });
        } else {
          entireString += chunk;
          const currentBulletPoints = entireString
            .split(/(?: - )|(?:\\n)/)
            .filter((line) => line.trim().length > 0)
            .map((line) => line.trim());
          messageCallback(currentBulletPoints);
        }
      },

      onerror(error) {
        console.error('Error in fetchEventSource:', error);
      },
    },
  );
};

const sendPublicSummaryToSupabase = async ({
  summary,
  noteId,
}: {
  summary: string;
  noteId: string;
}) => {
  try {
    const response = await fetch('/api/update-public-note-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        noteId,
        summary,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error);
    }

    const data = await response.json();
  } catch (error) {
    console.error('Error updating summary:', error);
  }
};

const createPublicNotesSummary = async (
  { transcription, noteId, name, topic }: CreatePublicNotesParams,
  messageCallback: (message: string) => void,
): Promise<void> => {
  let fullSummary = '';

  await fetchEventSource(
    `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/create-summary`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        transcription,
        name,
        topic,
      }),
      onmessage(ev) {
        const summaryChunk = ev.data;
        if (summaryChunk === 'END_OF_SUMMARY') {
          sendPublicSummaryToSupabase({
            summary: fullSummary,
            noteId: noteId,
          });
        } else {
          fullSummary += summaryChunk;
          messageCallback(fullSummary);
        }
      },

      onerror(error) {
        console.error('Error in fetchEventSource:', error);
      },
    },
  );
};

const getYoutubeTranscript = async (videoId: string) => {
  try {
    const response = await fetch('/api/get-youtube-transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching transcript:', error);
  }
};

const insertExtractedText = async (
  params: InsertExtractedTextParams,
): Promise<any> => {
  const response = await fetch('/api/insert-extracted-text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error);
  }

  const data = await response.json();

  return data;
};

export {
  insertNote,
  createNotesSummary,
  createNotesFacts,
  insertPublicNote,
  createPublicNotesFacts,
  getYoutubeTranscript,
  createPublicNotesSummary,
  insertExtractedText,
};
