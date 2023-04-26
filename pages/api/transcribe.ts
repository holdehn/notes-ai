// pages/api/transcribe.ts

import { NextApiRequest, NextApiResponse } from 'next';
import busboy from 'busboy';
import FormData from 'form-data';
import mime from 'mime';
import { Transform } from 'stream';
import stream from 'stream';
import ffmpeg from 'fluent-ffmpeg';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function transcribe(file: Buffer, contentType: string) {
  console.log(`Transcribing file with contentType: ${contentType}`);

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
  console.log(`Transcription API response status: ${response.status}`);
  return response;
}

//convert to mp3 from any other format
//mp3 instead of wav to keep file size to openai api limit
async function convertToMp3(buffer: Buffer, fileType: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const input = new stream.PassThrough();
    input.end(buffer);
    console.log('input');

    const chunks: Buffer[] = [];
    const output = new Transform({
      transform(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    console.log('output');
    const command = ffmpeg(input)
      .inputFormat(fileType.split('/')[1])
      .outputFormat('mp3')
      .output(output)
      .on('error', (error) => {
        reject(error);
      });

    console.log('command');
    command.run();
    console.log('run');
    output.on('finish', () => {
      resolve(Buffer.concat(chunks));
    });
  });
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
        console.log(fileType);

        let responseData = Buffer.from([]);
        file.on('data', (data) => {
          responseData = Buffer.concat([responseData, data]);
        });
        file.on('end', async () => {
          let response;
          try {
            // const mp3 = await convertToMp3(responseData, fileType);
            // console.log('mp3', mp3);
            // response = await transcribe(mp3, 'audio/mp3');
            response = await transcribe(responseData, fileType);
          } catch (error: any) {
            return res.status(500).json({ error: error.response });
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
