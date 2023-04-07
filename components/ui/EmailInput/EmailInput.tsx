import * as yup from 'yup';
import { GetServerSideProps } from 'next';
import { useFormik } from 'formik';
import { supabaseClient } from '@/supabase-client';
import NavLink from '../NavLink';

interface Props {
  onSuccess: () => void;
}
export default function EmailInput(props: Props) {
  const { onSuccess } = props;
  const validationSchema = yup.object().shape({
    email: yup.string().email().required(),
  });
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: validationSchema,

    onSubmit: async (values: { email: string }, { resetForm }) => {
      try {
        // Check if the email already exists in the database
        const { data, error: fetchError } = await supabaseClient
          .from('email_list_beta')
          .select('email')
          .eq('email', values.email);

        if (fetchError) {
          console.log(JSON.stringify(fetchError));
          throw fetchError;
        }

        if (data && data.length > 0) {
          // Email already exists in the database
          console.log('Email already submitted.');
        } else {
          // Proceed with the submission
          const { error: insertError } = await supabaseClient
            .from('email_list_beta')
            .insert({ email: values.email });

          if (insertError) {
            console.log(JSON.stringify(insertError));
            throw insertError;
          }
        }
      } catch (error) {
        console.error('Error submitting email:', error);
      }
      resetForm();

      onSuccess();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="max-w-md px-4 mx-auto mt-4">
        <label htmlFor="email" className="block py-3 text-gray-500">
          Your Email
        </label>
        <div className="flex items-center p-2 border rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-100 w-7 h-7"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <input
            type="email"
            placeholder="name@edulink.com"
            id="email"
            className="w-full p-1 ml-3 text-gray-200 outline-none bg-transparent"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            name="email"
          />
        </div>
      </div>
      <div className="max-w-3xl mx-auto text-center space-y-4 text-white">
        <div className="flex items-center justify-center gap-x-3 font-medium text-sm mt-6">
          <button
            type="submit"
            className="px-5 py-3 text-white duration-150 bg-indigo-600 rounded-lg hover:bg-indigo-700 active:shadow-lg"
          >
            Sign up for the Beta
          </button>
        </div>
      </div>
    </form>
  );
}
