// pages/api/proxy.ts

import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const imageUrl = req.query.imageUrl as string;

  try {
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();

    res.setHeader('Content-Type', response.headers.get('Content-Type') || '');
    res.setHeader(
      'Content-Length',
      response.headers.get('Content-Length') || '',
    );
    res.send(buffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).send('Error fetching image');
  }
};

export default handler;
