import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    userID,
    formikValues,
    agentName,
    transcription,
    notes,
    summary,
    upload_ids,
  } = req.body;

  if (!userID) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const supabase = createServerSupabaseClient({ req, res });
  const noteId = uuidv4();
  console.log('userId', userID);

  const { data: noteData, error: noteError } = await supabase
    .from('notes')
    .insert([
      {
        id: noteId,
        title: formikValues.title,
        context: formikValues.context,
        functionality: formikValues.functionality,
        upload_ids: upload_ids,
        user_id: userID,
        agent_name: agentName,
        color_theme: getRandomColor(),
        transcription: transcription,
        notes: notes,
        summary: summary,
      },
    ]);

  if (noteError) {
    return res
      .status(500)
      .json({ error: 'Error inserting note', details: noteError });
  }

  res.status(200).json({ noteId: noteId });
};

function getRandomColor() {
  const colors = ['blue', 'red', 'green', 'gray', 'indigo', 'purple'];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return `bg-${randomColor}-600`;
}
export default handler;
