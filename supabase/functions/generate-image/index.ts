import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { prompt, options } = await req.json();

    // Helper function to convert File to base64
    const convertFileToBase64 = async (fileData: string): Promise<string> => {
      // The fileData should already be base64 from the frontend
      return fileData;
    };

    // Build content array starting with the text prompt
    const content: any[] = [
      {
        type: "input_text",
        text: prompt
      }
    ];

    // Add reference images if any
    if (options.referenceImages && options.referenceImages.length > 0) {
      for (const imageBase64 of options.referenceImages) {
        content.push({
          type: "input_image",
          image_url: `data:image/jpeg;base64,${imageBase64}`
        });
      }
    }

    // Use Responses API instead of Image API for multimodal support
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: content
          }
        ],
        tools: [{ type: "image_generation" }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    
    // Extract image from response
    const imageGenerationCalls = data.output?.filter((output: any) => output.type === "image_generation_call");
    
    if (imageGenerationCalls && imageGenerationCalls.length > 0) {
      const imageBase64 = imageGenerationCalls[0].result;
      const imageUrl = `data:image/png;base64,${imageBase64}`;
      
      return new Response(JSON.stringify({ imageUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('No image was generated in the response');
    }
  } catch (error: any) {
    console.error('Image generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});