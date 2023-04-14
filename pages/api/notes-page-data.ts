// /api/notes-page-data.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '@/supabase-client';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userID } = req.query;

  if (!userID) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const { data: userData, error: userError } = await supabaseClient
    .from('users')
    .select('*')
    .eq('id', userID);

  if (userError) {
    return res.status(500).json({ error: userError.message });
  }

  const { data: notesData, error: notesError } = await supabaseClient
    .from('notes')
    .select('*')
    .eq('user_id', userID);

  if (notesError) {
    return res.status(500).json({ error: notesError.message });
  }

  return res.status(200).json({ user: userData, notes: notesData });
};

export default handler;
