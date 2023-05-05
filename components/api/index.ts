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
 * Creates a stream of a summary of the notes.
 * @param params Params for this request
 * @param messageCallback Callback as additional data is received
 */
const createNotesSummary = async (
  { transcription }: CreateNotesSummaryParams,
  messageCallback: (message: string) => void,
): Promise<void> => {
  console.log(
    `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL}/create-summary`,
  );
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
        messageCallback(ev.data);
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
