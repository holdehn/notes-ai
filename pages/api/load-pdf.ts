import { NextApiRequest, NextApiResponse } from 'next';
import busboy from 'busboy';
import pdfParse from 'pdf-parse';

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
      busboyInstance.on('file', (name, file) => {
        const chunks: Buffer[] = [];
        file.on('data', (data) => {
          chunks.push(data);
        });

        file.on('end', async () => {
          // Read the PDF from the request
          const pdfBuffer = Buffer.concat(chunks);

          // Extract text from the PDF using pdf-parse
          const pdfData = await pdfParse(pdfBuffer);
          const extractedText = pdfData.text;

          res.status(200).json({ text: extractedText });
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
