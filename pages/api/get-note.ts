import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '@/supabase-client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { noteId, userId } = req.query;

  if (!noteId || !userId) {
    return res.status(400).json({ error: 'Note ID is required' });
  }

  const { data: noteData, error: noteError } = await supabaseClient
    .from('notes')
    .select('*')
    .match({ id: noteId, user_id: userId });

  if (noteError) {
    return res.status(500).json({ error: noteError.message });
  }

  return res.status(200).json({ note: noteData });
};

export default handler;
