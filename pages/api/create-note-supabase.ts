import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userID, formikValues, transcription, noteID, type } = req.body;

  if (!userID) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data: noteData, error: noteError } = await supabase
    .from('notes')
    .insert([
      {
        id: noteID,
        title: formikValues.title,
        topic: formikValues.topic,
        user_id: userID,
        color_theme: getRandomColor(),
        transcription: transcription,
        type: type,
      },
    ]);

  if (noteError) {
    return res
      .status(500)
      .json({ error: 'Error inserting note', details: noteError });
  }

  res.status(200).json({ noteId: noteID });
};

function getRandomColor() {
  const colors = ['blue', 'red', 'green', 'gray', 'indigo', 'purple'];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return `bg-${randomColor}-600`;
}
export default handler;
