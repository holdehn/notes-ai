import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userID, quizID, formikValues, content, fileID } = req.body;

  if (!userID) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data: assignmentData, error: assignmentError } = await supabase
    .from('quiz')
    .insert([
      {
        id: quizID,
        title: formikValues.title,
        instructions: formikValues.instructions,
        user_id: userID,
        content: content,
        file_id: fileID,
        type: 'multiple choice',
      },
    ]);
  console.log(assignmentData);
  console.log(assignmentError);

  if (assignmentError) {
    return res
      .status(500)
      .json({ error: 'Error inserting assignment', details: assignmentError });
  }

  res.status(200).json({ assignmentData: assignmentData });
};

export default handler;
