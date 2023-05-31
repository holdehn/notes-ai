import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

interface AssignmentType {
  solutions: string[];
  questions: string[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userID, text, assignmentID, type, questionNumber } = req.body;

  if (!userID) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const supabase = createServerSupabaseClient({ req, res });

  if (type === 'solutions') {
    const { data: assignment, error } = await supabase
      .from('assignments')
      .select('solutions')
      .eq('id', assignmentID)
      .single();

    if (error) {
      return res
        .status(500)
        .json({ error: `Error fetching ${type}`, details: error });
    }

    // Update the specific solution in the array
    let updatedData: any[] = [];

    // Here we tell TypeScript that assignment is of type AssignmentType
    const typedAssignment = assignment as unknown as AssignmentType;

    // Check if 'solutions' exist and is not null, else initialize as empty array
    if (
      typedAssignment &&
      'solutions' in typedAssignment &&
      typedAssignment.solutions !== null
    ) {
      updatedData = [...typedAssignment.solutions];
    }

    if (questionNumber === 0) {
      updatedData.push(text);
    } else {
      // Ensure updatedData is long enough
      while (updatedData.length <= questionNumber - 1) {
        updatedData.push(null);
      }
      updatedData[questionNumber - 1] = text;
    }

    const { data: updatedAssignment, error: updateError } = await supabase
      .from('assignments')
      .update({ solutions: updatedData })
      .eq('id', assignmentID)
      .select('solutions');

    if (updateError) {
      return res
        .status(500)
        .json({ error: `Error updating ${type}`, details: updateError });
    }

    res.status(200).json(updatedAssignment);
  } else {
    return res.status(400).json({ error: 'Invalid type' });
  }
};

export default handler;
