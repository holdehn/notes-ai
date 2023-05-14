import { serve } from 'http/server.ts';
import PdfParse$1 from 'https://esm.sh/v120/@types/pdf-parse@1.1.1/index~.d.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    console.log('Processing request...');
    const form = await req.formData();
    const file = form.get('file') as File;
    console.log('Received file:', file);

    if (!file || file.type !== 'application/pdf') {
      console.log('No file found or not a PDF');
      return new Response(
        JSON.stringify({ success: false, error: 'No file found or not a PDF' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
    const pdfBuffer = await file.arrayBuffer();
    console.log('Loading PDF...');
    const pdf = await PdfParse$1(
      new Uint8Array(pdfBuffer) as unknown as Buffer,
    );
    console.log('Loaded PDF:', pdf);
    return new Response(JSON.stringify(pdf), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.log('Error while processing request:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
