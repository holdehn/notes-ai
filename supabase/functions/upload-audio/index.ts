import { serve } from 'https://deno.land/std@0.160.0/http/server.ts';
import { supabase } from '../_shared/supabase.ts';
import { corsHeaders } from '../_shared/cors.ts';
import {
  multiParser,
  FormFile,
} from 'https://deno.land/x/multiparser@0.114.0/mod.ts';

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const form = await multiParser(req);
    if (!form) {
      return new Response(
        JSON.stringify({ success: false, error: 'no file found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
    const video = form.files.video as FormFile;
    const fileID = form.fields.fileID as string;
    const userID = form.fields.userID as string;
    if (!video || !fileID || !userID) {
      return new Response(
        JSON.stringify({ success: false, error: 'no file found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
    console.log('step2');

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileID, video.content, {
        upsert: true,
        contentType: 'audio/mp3',
      });
    console.log('step5');
    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
    return new Response(JSON.stringify({ success: true, data: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});

// app.listen({ port: 8080 });
