// pages/api/insert-extracted-text.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { sectionID, formikValues, userID, coordinates } = req.body;

  const supabase = createServerSupabaseClient({ req, res });

  const { data, error } = await supabase.from('response_section').insert({
    id: sectionID,
    section_title: formikValues.sectionTitle,
    user_id: userID,
    coordinates,
  });

  if (error) {
    return res
      .status(500)
      .json({ error: 'Error inserting extracted text', details: error });
  }

  res.status(200).json({ message: 'Insert complete.', data });
};

export default handler;
