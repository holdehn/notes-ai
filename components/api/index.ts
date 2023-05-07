import {
  CreateNoteParams,
  CreateNoteResponse,
  CreateNotesSummaryParams,
  CreateNotesFactsParams,
  NoteSummary,
  Result,
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
    console.log('Sending summary:', summary);
    console.log('Sending noteID:', noteId);
    console.log('Sending userID:', userId);

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
    console.log('Summary updated:', data);
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
    console.log('Sending notes:', notes);
    console.log('Sending noteID:', noteId);
    console.log('Sending userID:', userId);

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
    console.log('Notes updated:', data);
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
    existingSummary,
    name,
    topic,
  }: CreateNotesSummaryParams,
  messageCallback: (message: string) => void,
): Promise<void> => {
  if (existingSummary) {
    console.log('Summary already exists, not generating a new one.');
    return;
  }

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
          sendSummaryToSupabase({
            summary: fullSummary,
            noteId: noteId,
            userId: userId,
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

const createNotesFacts = async (
  {
    transcription,
    userId,
    noteId,
    existingNotes,
    name,
    topic,
  }: CreateNotesFactsParams,
  messageCallback: (messages: string[]) => void,
): Promise<void> => {
  if (existingNotes) {
    console.log('Notes already exists, not generating a new one.');
    return;
  }

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
    },
  );
};

export { insertNote, createNotesSummary, createNotesFacts };
