// pages/api/upload-context.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from 'types_db';
import Busboy from 'busboy';
import { Readable } from 'stream';
import busboy from 'busboy';
import mime from 'mime';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res,
  });
  const {
    data: { user },
  } = await supabaseServerClient.auth.getUser();
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user_id = user.id;
  console.log('user_id', user_id);

  try {
    const busboyInstance = busboy({ headers: req.headers });
    let files: Buffer[] = [];
    let fileNames: any[] = [];
    req.pipe(busboyInstance);
    let agent_name = '';
    //get agent name
    busboyInstance.on('field', (name, value) => {
      if (name === 'agent_name') {
        agent_name = value;
      }
    });

    busboyInstance.on('file', async (name, file, info) => {
      let responseData = Buffer.from([]);
      file.on('data', (data) => {
        responseData = Buffer.concat([responseData, data]);
      });
      file.on('end', async () => {
        files.push(responseData);
        fileNames.push(info.filename);
      });

      console.log('agent_name', agent_name);
      const { data, error } = await supabaseServerClient
        .from('agents')
        .insert([{ name: agent_name, user_id: user_id, context: [fileNames] }])
        .select('id');

      if (error) {
        throw new Error('Failed to insert agent');
      }

      const agent_id = data?.[0].id;
      //upload each file once
      for (let i = 0; i < files.length; i++) {
        const { data, error: uploadError } = await supabaseServerClient.storage
          .from('context')
          .upload(`agents/${agent_id}/${fileNames[i]}`, files[i], {
            cacheControl: '3600',
            upsert: false,
            contentType: mime.getType(fileNames[i]) as unknown as string,
          });

        if (uploadError) {
          throw new Error('Failed to upload file');
        }
      }
    });

    busboyInstance.on('finish', () => {
      res.status(200).json({ message: 'success' });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
