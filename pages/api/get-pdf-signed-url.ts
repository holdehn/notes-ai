import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { fileID } = req.body;

  const supabase = createServerSupabaseClient({ req, res });
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('documents')
    .createSignedUrl(fileID, 60);

  if (signedUrlError) {
    return res.status(500).json({ error: signedUrlError.message });
  }

  return res.status(200).json({ signedUrl: signedUrlData.signedUrl });
};

export default handler;
