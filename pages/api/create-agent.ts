// pages/api/create-agent.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '@/supabase-client';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    try {
      const { name, userID, agentType } = req.body;
      console.log('name', name);
      const { data, error } = await supabaseClient.from('agents').insert({
        title: name,
        type: agentType,
        user_id: userID,
      });

      if (error) {
        throw error;
      }

      res.status(200).json({ data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
};
