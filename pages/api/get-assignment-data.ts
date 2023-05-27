///http://localhost:3000/grading/assignments/3cb1483b-3e7f-479e-b2e3-6ee4f2a513a6
// /api/get-note.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { assignmentID, userId } = req.query;

  if (!assignmentID || !userId) {
    return res.status(400).json({ error: 'Note ID and User ID are required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data: noteData, error: noteError } = await supabase
    .from('assignments')
    .select('*')
    .match({ id: assignmentID, user_id: userId })
    .single();

  if (noteError) {
    return res.status(500).json({ error: noteError.message });
  }

  return res.status(200).json({ note: noteData });
};

export default handler;
