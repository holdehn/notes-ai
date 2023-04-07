// /api/upload-transcribe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import { supabaseClient } from '../../utils/supabase-client';
import { parseForm, ParsedForm } from '../../utils/parse-form';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function uploadTranscribe(req: NextApiRequest, res: NextApiResponse) {
  // Check if the request method is POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Check for user session
  const session = await getSession({ req });
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // Parse the form data
  const form: ParsedForm = await parseForm(req);

  // Check if there is an audio file in the form
  if (!form || !form.files || !form.files.file) {
    res.status(400).json({ error: 'No audio file found' });
    return;
  }

  const audioFile = form.files.file;
  const userId = session.user.id;

  // Upload the audio file to Supabase storage
  const { data, error } = await supabaseClient.storage
    .from('audio-files')
    .upload(`${userId}/${audioFile.filename}`, audioFile.content, {
      upsert: true,
      contentType: audioFile.mimetype,
    });

  // Handle upload errors
  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  // Send the response back to the client
  res.status(200).json({ message: 'Audio file uploaded successfully' });
}

export default uploadTranscribe;
