export interface CreateNoteParams {
  userID: string;
  formikValues: {
    title: string;
    topic?: string;
  };
  noteID: string;
  transcription: string;
  type: string;
}
export interface CreatePublicNoteParams {
  userID?: string | null;
  formikValues: {
    title: string;
    topic?: string;
    link?: string;
  };
  noteID: string;
  transcription: string;
}

export type CreateNoteResponse =
  | { error: string; noteId?: undefined }
  | { noteId: string; error?: undefined };

export interface CreateNotesSummaryParams {
  transcription: string;
  userId: string;
  noteId: string;
  topic: string;
  type: string;
  name: string;
}

export interface CreateNotesFactsParams {
  transcription: string;
  userId: string;
  noteId: string;
  topic: string;
  name: string;
  type: string;
}

export interface CreatePublicNotesParams {
  transcription: string;
  noteId: string;
  topic: string;

  name: string;
}

export interface NoteSummary {
  text: string;
}

export type Result<TData, TError> =
  | {
      data: TData;
      error?: undefined;
    }
  | {
      error: TError;
      data?: undefined;
    };

export interface InsertExtractedTextParams {
  extractedText: string;
  userId: string;
}
