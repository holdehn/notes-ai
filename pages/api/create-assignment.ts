import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userID, formikValues, content, assignmentID, solution, fileID } =
    req.body;

  if (!userID) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data: assignmentData, error: assignmentError } = await supabase
    .from('assignments')
    .insert([
      {
        id: assignmentID,
        title: formikValues.title,
        description: formikValues.description,
        user_id: userID,
        content: content,
        file_id: fileID,
        color_theme: getRandomColor(),
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

function getRandomColor() {
  const colors = ['blue', 'red', 'green', 'gray', 'indigo', 'purple'];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return `bg-${randomColor}-600`;
}

export default handler;
