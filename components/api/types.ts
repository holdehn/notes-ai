export type Component = {
  title: string;
  ltr: {
    preview: string;
    react: {
      jsxTail: {
        code: string;
      }[];
    };
  };
  rtl: {
    preview: string;
    react: {
      jsxTail: {
        code: string;
      }[];
    };
  };
};
interface CreateNoteParams {
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

type CreateNoteResponse =
  | { error: string; noteId?: undefined }
  | { noteId: string; error?: undefined };

interface CreateNotesSummaryParams {
  transcription: string;
}

interface CreateNotesFactsParams {
  transcription: string;
  name: string;
  topic: string;
}

interface NoteSummary {
  text: string;
}

type Result<TData, TError> =
  | {
      data: TData;
      error?: undefined;
    }
  | {
      error: TError;
      data?: undefined;
    };

export {};
