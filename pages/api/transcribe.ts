// pages/api/transcribe.ts

import { NextApiRequest, NextApiResponse } from 'next';
import busboy from 'busboy';
import FormData from 'form-data';
import mime from 'mime';
import { Transform } from 'stream';
import stream from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function transcribe(file: Buffer, contentType: string) {
  const form = new FormData();
  form.append('file', file, {
    contentType,
    filename: `file.${mime.getExtension(contentType)}`,
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
  if (!response.ok) {
    console.log(response);
  }
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
        const fileType = info.mimeType;

        let responseData = Buffer.from([]);
        file.on('data', (data) => {
          responseData = Buffer.concat([responseData, data]);
        });
        file.on('end', async () => {
          let response;
          try {
            // const mp3 = await convertToMp3(responseData, fileType);

            response = await transcribe(responseData, fileType);
          } catch (error: any) {
            console.log(error);
            return res.status(500).json({ error: error });
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
