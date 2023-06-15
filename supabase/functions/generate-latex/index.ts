// import { serve } from 'http/server.ts';
// import { corsHeaders } from '../_shared/cors.ts';
// import FormData from 'https://cdn.skypack.dev/form-data';
// import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
// import {
//   FormFile,
//   multiParser,
// } from 'https://deno.land/x/multiparser@0.114.0/mod.ts';
// import { StructuredOutputParser } from 'langchain/output_parsers';

// serve(async (req: Request) => {
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders });
//   }
//   try {
//     //create a supabase client
//     const supabase = createClient(
//       // Supabase API URL - env var exported by default when deployed.
//       Deno.env.get('SUPABASE_URL') ?? '',
//       // Supabase API ANON KEY - env var exported by default when deployed.
//       Deno.env.get('SUPABASE_ANON_KEY') ?? '',
//       {
//         global: {
//           headers: { Authorization: req.headers.get('Authorization')! },
//         },
//       },
//     );

//     const form = await multiParser(req);
//     if (!form) {
//       return new Response(
//         JSON.stringify({ success: false, error: 'no file found' }),
//         {
//           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//           status: 400,
//         },
//       );
//     }

//     const file = form.files.file as FormFile;
//     const fileID = form.fields.fileID as string;

//     // Conversion formats to be used.
//     const conversionFormats = {
//       docx: false,
//       'tex.zip': false,
//       latex: false,
//       mmd: true,
//     };

//     const options = {
//       conversion_formats: conversionFormats,
//       rm_spaces: true,
//     };
//     const newFile = new File([file.content], fileID, {
//       type: file.contentType,
//     });

//     const newFormData = new FormData();
//     newFormData.append('file', newFile);
//     newFormData.set('options_json', JSON.stringify(options));

//     const uploadPromise = supabase.storage
//       .from('documents')
//       .upload(fileID, file.content, {
//         upsert: true,
//         contentType: file.contentType,
//       });

//     let fetchPromise;

//     if (file.contentType === 'image/png' || file.contentType === 'image/jpeg') {
//       fetchPromise = fetch('https://api.mathpix.com/v3/text', {
//         method: 'POST',
//         headers: {
//           app_id: Deno.env.get('MATHPIX_APP_ID') as unknown as string,
//           app_key: Deno.env.get('MATHPIX_APP_KEY') as unknown as string,
//         },
//         body: newFormData,
//       });
//     } else if (file.contentType === 'application/pdf') {
//       fetchPromise = fetch('https://api.mathpix.com/v3/pdf', {
//         method: 'POST',
//         headers: {
//           app_id: Deno.env.get('MATHPIX_APP_ID') as unknown as string,
//           app_key: Deno.env.get('MATHPIX_APP_KEY') as unknown as string,
//         },
//         body: newFormData,
//       });
//     } else {
//       return new Response(
//         JSON.stringify({ success: false, error: 'invalid file type' }),
//         {
//           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//           status: 400,
//         },
//       );
//     }

//     const [uploadResponse, fetchResponse] = await Promise.all([
//       uploadPromise,
//       fetchPromise,
//     ]);

//     if (!fetchResponse.ok) {
//       throw new Error('Mathpix API request failed');
//     }

//     const response = await fetchResponse.json();

//     let id;
//     if (file.contentType === 'image/png' || file.contentType === 'image/jpeg') {
//       const { request_id } = response;
//       id = request_id;
//     }

//     if (file.contentType === 'application/pdf') {
//       const { pdf_id } = response;
//       id = pdf_id;
//     }

//     // Function to get processing status
//     async function getProcessingStatus(id: string) {
//       const response = await fetch(`https://api.mathpix.com/v3/pdf/${id}`, {
//         headers: {
//           app_id: Deno.env.get('MATHPIX_APP_ID') as unknown as string,
//           app_key: Deno.env.get('MATHPIX_APP_KEY') as unknown as string,
//         },
//       });
//       const data = await response.json();
//       return data;
//     }
//     console.log('step6');

//     // Function to get conversion status
//     async function getConversionStatus(id: string) {
//       const response = await fetch(
//         `https://api.mathpix.com/v3/converter/${id}`,
//         {
//           headers: {
//             app_id: Deno.env.get('MATHPIX_APP_ID') as unknown as string,
//             app_key: Deno.env.get('MATHPIX_APP_KEY') as unknown as string,
//           },
//         },
//       );
//       const data = await response.json();
//       return data;
//     }

//     console.log('step7');

//     // Function to get conversion results
//     async function getConversionResults(id: string, format: string) {
//       const response = await fetch(
//         `https://api.mathpix.com/v3/pdf/${id}.${format}`,
//         {
//           headers: {
//             app_id: Deno.env.get('MATHPIX_APP_ID') as unknown as string,
//             app_key: Deno.env.get('MATHPIX_APP_KEY') as unknown as string,
//           },
//         },
//       );
//       const data = await response.text(); // Assuming you're getting text data. Adjust as needed.
//       return data;
//     }

//     console.log('step8');

//     // Now, use these functions to get status and results
//     let processingStatus = await getProcessingStatus(id);
//     while (processingStatus.status !== 'completed') {
//       // Wait for some time before checking again
//       await new Promise((resolve) => setTimeout(resolve, 5000));
//       processingStatus = await getProcessingStatus(id);
//     }

//     console.log('step9');
//     let conversionStatus = await getConversionStatus(id);
//     while (conversionStatus.status !== 'completed') {
//       // Wait for some time before checking again
//       await new Promise((resolve) => setTimeout(resolve, 5000));
//       conversionStatus = await getConversionStatus(id);
//     }
//     console.log('step10');

//     // Once all processing and conversions are done, get results
//     const results = await getConversionResults(id, 'mmd');

//     return new Response(JSON.stringify({ success: true, data: results }), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       status: 200,
//     });
//   } catch (error: any) {
//     return new Response(JSON.stringify({ error: error.message }), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       status: 400,
//     });
//   }
// });
