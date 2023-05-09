// pages/api/update-public-note-facts.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { noteId, notes } = req.body;

  if (!noteId || !notes) {
    return res
      .status(400)
      .json({ error: 'Note ID, User ID, and Notes are required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data, error } = await supabase
    .from('public_notes')
    .update({ notes: notes })
    .match({ id: noteId });

  if (error) {
    return res
      .status(500)
      .json({ error: 'Error updating notes', details: error });
  }

  res.status(200).json({ message: 'Notes updated', data });
};

export default handler;
