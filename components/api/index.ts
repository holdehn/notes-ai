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

const createNotesSummary = async ({
  transcription,
}: CreateNotesSummaryParams): Promise<Result<NoteSummary, string>> => {
  const response = await fetch('/api/create-summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcription,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log('createNotes error' + JSON.stringify(errorData));
    throw new Error(errorData.message);
  }

  const data = await response.json();

  if (!response.ok) {
    const errorData = await response.json();

    return { error: errorData.message ?? 'Unknown error' };
  }

  return { data: data.data.text };
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
