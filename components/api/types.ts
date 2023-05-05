export interface CreateNoteParams {
  userID: string;
  fileObjects: File[];
  formikValues: {
    title: string;
    context: string;
    functionality: string;
  };
  transcription: string;
  notes?: string[];
  summary: string;
}

export type CreateNoteResponse =
  | { error: string; noteId?: undefined }
  | { noteId: string; error?: undefined };

export interface CreateNotesSummaryParams {
  transcription: string;
}

export interface CreateNotesFactsParams {
  transcription: string;
  name: string;
  topic: string;
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
