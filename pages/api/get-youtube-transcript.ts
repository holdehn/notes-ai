// pages/api/getYoutubeTranscript.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { videoId } = req.body;

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const combinedTranscript = transcript.map((item) => item.text).join(' ');

    res.status(200).json({ transcript: combinedTranscript });
  } catch (err) {
    res
      .status(500)
      .json({ error: 'An error occurred while fetching the transcript.' });
  }
}
