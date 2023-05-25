// /api/notes-page-data.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userID } = req.query;

  if (!userID) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data: assignmentData, error: assignmentError } = await supabase
    .from('assignments')
    .select('*')
    .eq('user_id', userID)
    .order('created_at', { ascending: false });

  if (assignmentError) {
    return res.status(500).json({ error: assignmentError.message });
  }

  return res.status(200).json({ assignments: assignmentData });
};

export default handler;
