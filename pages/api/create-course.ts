import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userID, formikValues, courseID } = req.body;

  if (!userID) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .insert([
      {
        course_id: courseID,
        title: formikValues.title,
        subject: formikValues.subject,
        user_id: userID,
        color_theme: getRandomColor(),
      },
    ]);
  console.log(courseError);

  if (courseError) {
    return res
      .status(500)
      .json({ error: 'Error inserting assignment', details: courseError });
  }

  res.status(200).json({ courses: courseData });
};

export default handler;

function getRandomColor() {
  const colors = ['blue', 'red', 'green', 'gray', 'indigo', 'purple'];

  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return `bg-${randomColor}-100`;
}
