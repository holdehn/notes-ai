import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userID, formikValues, agentName, transcription, upload_ids } =
    req.body;

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
      },
    ]);

  if (noteError) {
    return res
      .status(500)
      .json({ error: 'Error inserting note', details: noteError });
  }

  res.status(200).json({ noteId: noteId });
};

// Helper function to generate a random color
const getRandomColor = () => {
  // Add your color generation logic here
};

export default handler;
