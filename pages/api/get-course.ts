// /api/get-note.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userID, courseID } = req.query;

  if (!userID) {
    return res.status(400).json({ error: 'User ID are required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .match({ user_id: userID, course_id: courseID });

  if (courseError) {
    return res.status(500).json({ error: courseError.message });
  }

  const { data: assignmentData, error: assignmentError } = await supabase
    .from('assignments')
    .select('*')
    .match({ user_id: userID, course_id: courseID })
    .order('created_at', { ascending: false });

  if (assignmentError) {
    return res.status(500).json({ error: assignmentError.message });
  }

  return res.status(200).json({ courseData, assignments: assignmentData });
};

export default handler;
