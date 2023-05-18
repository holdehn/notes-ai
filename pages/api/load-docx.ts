import { NextApiRequest, NextApiResponse } from 'next';
import busboy from 'busboy';
import mammoth from 'mammoth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      // Parse request using Busboy
      const busboyInstance = busboy({ headers: req.headers });
      req.pipe(busboyInstance);

      // Extract the file from the request
      busboyInstance.on('file', async (name, file) => {
        const chunks: Buffer[] = [];
        file.on('data', (data) => {
          chunks.push(data);
        });

        file.on('end', async () => {
          // Read the Docx from the request
          const docxBuffer = Buffer.concat(chunks);

          // Extract text from the Docx using mammoth
          const text = await mammoth.extractRawText({ buffer: docxBuffer });

          res.status(200).json({ text: text.value });
        });
      });
    } catch (error) {
      res.status(500).json({ error: JSON.stringify(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
