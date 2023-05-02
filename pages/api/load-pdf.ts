import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import pdfParse from 'pdf-parse';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        req
          .on('data', (chunk) => {
            chunks.push(chunk);
          })
          .on('error', (err) => {
            reject(err);
          })
          .on('end', () => {
            resolve(Buffer.concat(chunks));
          });
      });

      // Extract text from the PDF using pdf-parse
      const pdfData = await pdfParse(pdfBuffer);
      const extractedText = pdfData.text;

      res.status(200).json({ text: extractedText });
    } catch (error) {
      res.status(500).json({ error: JSON.stringify(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
