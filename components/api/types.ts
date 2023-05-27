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
export interface CreateAssignmentParams {
  userID: string;
  formikValues: {
    title: string;
    question: string;
    solution: string;
  };
  content: string;
  assignmentID: string;
  fileID: string;
}
export interface CreateQuizParams {
  userID: string;
  formikValues: {
    title: string;
    instructions: string;
  };
  content: string;
  quizID: string;
  fileID: string;
  quizType?: string | null;
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
export interface insertAssignmentFileParams {
  fileID: string;
  userID: string;
  file: File;
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
