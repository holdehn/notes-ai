import { serve } from 'https://deno.land/std@0.160.0/http/server.ts'; //@ts-ignore
import { corsHeaders } from '/Users/holden/Projects/edulink/supabase/_shared/cors.ts'; //@ts-ignore
import FormData from 'https://cdn.skypack.dev/form-data'; //@ts-ignore

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const form = await req.formData();
    const file = form.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'no file found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
    console.log('step2');
    const fileType = file.type;
    console.log(fileType);

    const newFormData = new FormData();
    newFormData.set('file', file);
    newFormData.set('model', 'whisper-1');

    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        },
        body: newFormData,
      },
    );

    if (!response.ok) {
      console.log(response);
      return new Response(
        JSON.stringify({ success: false, error: 'Whisper API request failed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        },
      );
    }

    const transcript = await response.json();
    return new Response(JSON.stringify({ success: true, transcript }), {
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
