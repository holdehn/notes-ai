///http://localhost:3000/grading/assignments/3cb1483b-3e7f-479e-b2e3-6ee4f2a513a6
// /api/get-note.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { assignmentID, userID } = req.query;

  if (!assignmentID || !userID) {
    return res.status(400).json({ error: 'Note ID and User ID are required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data: assignmentData, error: assignmentError } = await supabase
    .from('assignments')
    .select('*')
    .match({ id: assignmentID, user_id: userID })
    .single();

  const fileID = assignmentData?.file_id;

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('documents')
    .createSignedUrl(fileID, 60);

  if (assignmentError) {
    return res.status(500).json({ error: assignmentError.message });
  }

  if (signedUrlError) {
    return res.status(500).json({ error: signedUrlError.message });
  }

  return res
    .status(200)
    .json({ assignment: assignmentData, signedUrl: signedUrlData.signedUrl });
};

export default handler;
