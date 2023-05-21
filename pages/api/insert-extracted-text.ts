// pages/api/insert-extracted-text.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { extractedText, userId } = req.body;

  if (!extractedText || !userId) {
    return res
      .status(400)
      .json({ error: 'Extracted Text and User ID are required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data, error } = await supabase
    .from('context')
    .insert([{ extracted_text: extractedText, user_id: userId }]);

  if (error) {
    return res
      .status(500)
      .json({ error: 'Error inserting extracted text', details: error });
  }

  res.status(200).json({ message: 'Extracted text inserted', data });
};

export default handler;
