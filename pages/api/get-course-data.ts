// /api/get-note.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userID } = req.query;

  if (!userID) {
    return res.status(400).json({ error: 'User ID are required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .match({ user_id: userID });

  if (courseError) {
    return res.status(500).json({ error: courseError.message });
  }

  return res.status(200).json({ courses: courseData });
};

export default handler;
