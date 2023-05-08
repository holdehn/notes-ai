// pages/api/update-note-facts.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { noteId, userId, notes } = req.body;

  if (!noteId || !userId || !notes) {
    return res
      .status(400)
      .json({ error: 'Note ID, User ID, and Notes are required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data, error } = await supabase
    .from('notes')
    .update({ notes: notes })
    .match({ id: noteId, user_id: userId });

  if (error) {
    return res
      .status(500)
      .json({ error: 'Error updating notes', details: error });
  }

  res.status(200).json({ message: 'Notes updated', data });
};

export default handler;
