// pages/api/transcribe.ts

import { NextApiRequest, NextApiResponse } from 'next';
import busboy from 'busboy';
import FormData from 'form-data';
import mime from 'mime';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function transcribe(file: Buffer, contentType: string) {
  const form = new FormData();
  form.append('file', file, {
    contentType,
    filename: `audio.${mime.getExtension(contentType) ?? 'mp3'}`,
  });
  form.append('model', 'whisper-1');
  const data = form.getBuffer();

  const response = await fetch(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
      body: data,
    },
  );
  return response;
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      // stream request to busboy
      const busboyInstance = busboy({ headers: req.headers });
      req.pipe(busboyInstance);
      busboyInstance.on('file', async (name, file, info) => {
        // stream file to openai

        let responseData = Buffer.from([]);
        file.on('data', (data) => {
          responseData = Buffer.concat([responseData, data]);
        });
        file.on('end', async () => {
          let response;
          try {
            response = await transcribe(responseData, info.mimeType);
          } catch (error: any) {
            return res.status(500).json({ error: error.response.data });
          }
          res.status(200).json({ transcript: await response.json() });
        });
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};
