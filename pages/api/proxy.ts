// pages/api/proxy.ts

import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { pdfUrl, imageUrl, title } = req.query;

  try {
    let url = '';
    let contentType = '';

    if (pdfUrl) {
      url = pdfUrl as string;
      contentType = 'application/pdf';
      res.setHeader('Content-Disposition', `inline; filename="${title}.pdf"`);
    } else if (imageUrl) {
      url = imageUrl as string;
      contentType = 'image/jpeg'; // You might need to adjust this based on the actual image format
    } else {
      throw new Error('No valid URL provided');
    }

    const response = await fetch(url);
    const buffer = await response.buffer();

    res.setHeader('Content-Type', contentType);
    res.send(buffer);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).send('Error fetching resource');
  }
};

export default handler;
