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

/**
 * Creates a stream of a summary of the notes.
 * @param params Params for this request
 * @param messageCallback Callback as additional data is received
 */
const createNotesSummary = async (
  { transcription, userId, noteId, existingSummary }: CreateNotesSummaryParams,
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
  params: CreateNotesFactsParams,
): Promise<Result<NoteSummary, string>> => {
  const response = await fetch('/api/create-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log('createNotesFacts error' + JSON.stringify(errorData));
    throw new Error(errorData.message);
  }

  const data = await response.json();

  if (!response.ok) {
    const errorData = await response.json();

    return { error: errorData.message ?? 'Unknown error' };
  }

  return { data: data.data.text };
};

export { insertNote, createNotesSummary, createNotesFacts };
