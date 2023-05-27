import { serve } from 'http/server.ts';
import { corsHeaders } from '../_shared/cors.ts'; //@ts-ignore
import FormData from 'https://cdn.skypack.dev/form-data'; //@ts-ignore

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    console.log('step1');
    const form = await req.formData();
    const file = form.get('file') as File;
    console.log(file);
    console.log('step2');

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'no file found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

    const newFormData = new FormData();
    newFormData.set('file', file);
    newFormData.set(
      'options_json',
      JSON.stringify({ conversion_formats: { mmd: true } }),
    );

    const response = await fetch('https://api.mathpix.com/v3/text', {
      method: 'POST',
      headers: {
        app_id: Deno.env.get('MATHPIX_APP_ID') as unknown as string,
        app_key: Deno.env.get('MATHPIX_APP_KEY') as unknown as string,
      },
      body: newFormData,
    });
    console.log(response);
    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: 'Mathpix API request failed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        },
      );
    }

    const rawData = await response.json();
    console.log(rawData);
    const data = parseMathpixData(rawData);
    console.log(data);
    console.log('step5');
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
function parseMathpixData(data: any) {
  const latexStyled = data.latex_styled;
  console.log(latexStyled);
  const formattedData = latexStyled.replace(/\\\\/g, '\n').replace(/&/g, ', ');
  return formattedData;
}
