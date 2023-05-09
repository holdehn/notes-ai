// /api/get-note.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { noteId } = req.query;

  if (!noteId) {
    return res.status(400).json({ error: 'Note ID and User ID are required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data: noteData, error: noteError } = await supabase
    .from('public_notes')
    .select('*')
    .match({ id: noteId })
    .order('created_at', { ascending: false });

  if (noteError) {
    return res.status(500).json({ error: noteError.message });
  }

  return res.status(200).json({ note: noteData });
};

export default handler;
