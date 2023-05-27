import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import {
  multiParser,
  FormFile,
} from 'https://deno.land/x/multiparser@0.114.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

serve(async (req: Request) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const supabase = createClient(
      // Supabase API URL - env var exported by default when deployed.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default when deployed.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    );

    const form = await multiParser(req);
    console.log('step0');
    console.log(form);
    if (!form) {
      return new Response(
        JSON.stringify({ success: false, error: 'no file found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
    console.log('step1');
    console.log(JSON.stringify(form.fields));
    const file = form.files.file as FormFile;
    const fileID = form.fields.fileID as string;
    const userID = form.fields.userID as string;
    if (!file || !fileID || !userID) {
      return new Response(
        JSON.stringify({ success: false, error: 'no file found' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
    const fileType = file.contentType;
    console.log(fileType);

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileID, file.content, {
        upsert: true,
        contentType: file.contentType,
      });
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage.from('documents').createSignedUrl(fileID, 60);
    console.log('step2');
    console.log(signedUrlData);

    console.log('step5');
    console.log(data);
    console.log(error);
    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
        data: data,
        signedUrl: signedUrlData?.signedUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
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
