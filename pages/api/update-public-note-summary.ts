// pages/api/update-public-summary.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { noteId, summary } = req.body;

  if (!noteId || !summary) {
    return res
      .status(400)
      .json({ error: 'Note ID, User ID, and Summary are required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data, error } = await supabase
    .from('public_notes')
    .update({ summary })
    .match({ id: noteId });

  if (error) {
    return res
      .status(500)
      .json({ error: 'Error updating summary', details: error });
  }

  res.status(200).json({ message: 'Summary updated', data });
};

export default handler;
