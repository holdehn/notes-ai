import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userID, text, assignmentID, type } = req.body;

  if (!userID) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const supabase = createServerSupabaseClient({ req, res });
  if (type === 'question') {
    const { data: assignment, error } = await supabase
      .from('assignments')
      .select('questions')
      .eq('id', assignmentID)
      .single();

    if (error) {
      return res
        .status(500)
        .json({ error: 'Error fetching question', details: error });
    }

    const newQuestions = assignment?.questions
      ? [...assignment.questions, text]
      : [text];

    const { data: updatedAssignment, error: questionError } = await supabase
      .from('assignments')
      .update({ questions: newQuestions })
      .eq('id', assignmentID);

    if (questionError) {
      return res
        .status(500)
        .json({ error: 'Error inserting question', details: questionError });
    }

    res.status(200).json(updatedAssignment);
  } else if (type === 'solution') {
    const { data: assignment, error } = await supabase
      .from('assignments')
      .select('solutions')
      .eq('id', assignmentID)
      .single();

    if (error) {
      return res
        .status(500)
        .json({ error: 'Error fetching solution', details: error });
    }

    const newSolutions = assignment?.solutions
      ? [...assignment.solutions, text]
      : [text];

    const { data: updatedAssignment, error: solutionError } = await supabase
      .from('assignments')
      .update({ solutions: newSolutions })
      .eq('id', assignmentID);

    if (solutionError) {
      return res
        .status(500)
        .json({ error: 'Error inserting solution', details: solutionError });
    }

    res.status(200).json(updatedAssignment);
  }
};

export default handler;
