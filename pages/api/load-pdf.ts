import { NextApiRequest, NextApiResponse } from 'next';
import busboy from 'busboy';
import { getDocument } from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdf = await getDocument(buffer).promise;
  let extractedText = '';

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const strings = textContent.items
      .filter((item): item is TextItem => 'str' in item)
      .map((item) => item.str);
    extractedText += strings.join(' ') + '\n';
  }

  return extractedText;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    try {
      const busboyInstance = busboy({ headers: req.headers });
      req.pipe(busboyInstance);

      busboyInstance.on('file', (name, file) => {
        const chunks: Buffer[] = [];
        file.on('data', (data) => {
          chunks.push(data);
        });

        file.on('end', async () => {
          const pdfBuffer = Buffer.concat(chunks);
          const extractedText = await extractTextFromPdf(pdfBuffer);
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
