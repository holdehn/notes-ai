import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { formikValues, transcription, noteID } = req.body;
  const supabase = createServerSupabaseClient({ req, res });

  const { data: noteData, error: noteError } = await supabase
    .from('public_notes')
    .insert([
      {
        id: noteID,
        title: formikValues.title,
        topic: formikValues.topic,
        color_theme: getRandomColor(),
        transcription: transcription,
        link: formikValues.link,
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
