
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Enhanced error handling for different error types
const createErrorResponse = (message: string, status: number = 500, code?: string) => {
  console.error(`Error (${status}): ${message}`);
  return new Response(
    JSON.stringify({ 
      error: message, 
      code,
      timestamp: new Date().toISOString()
    }), 
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
};

const validateInput = (prompt: string) => {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt is required and must be a string');
  }
  
  if (prompt.length > 4000) {
    throw new Error('Prompt is too long. Maximum length is 4000 characters');
  }
  
  if (prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }
};

const handleOpenAIError = (error: any, status: number) => {
  console.error('OpenAI API error:', error);
  
  if (status === 401) {
    throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
  } else if (status === 429) {
    throw new Error('Rate limit exceeded. Please try again later.');
  } else if (status === 400) {
    throw new Error('Invalid request. Please check your prompt and try again.');
  } else if (status === 500) {
    throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
  } else if (status === 503) {
    throw new Error('OpenAI service is overloaded. Please try again in a few minutes.');
  } else {
    throw new Error(`OpenAI API error: ${error.message || 'Unknown error'}`);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    if (!openAIApiKey) {
      return createErrorResponse('OpenAI API key not configured', 500, 'OPENAI_API_KEY_MISSING');
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      return createErrorResponse('Invalid JSON in request body', 400, 'INVALID_REQUEST_FORMAT');
    }

    const { prompt, options } = requestBody;

    // Validate inputs
    try {
      validateInput(prompt);
    } catch (error) {
      return createErrorResponse(error.message, 400, 'VALIDATION_ERROR');
    }

    // Helper function to convert File to base64
    const convertFileToBase64 = async (fileData: string): Promise<string> => {
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

    // Use Responses API with timeout and retry logic
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
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
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        handleOpenAIError(errorData, response.status);
      }

      const data = await response.json();
      
      // Extract image from response
      const imageGenerationCalls = data.output?.filter((output: any) => output.type === "image_generation_call");
      
      if (imageGenerationCalls && imageGenerationCalls.length > 0) {
        const imageBase64 = imageGenerationCalls[0].result;
        
        // Validate base64 image
        if (!imageBase64 || typeof imageBase64 !== 'string') {
          throw new Error('Invalid image data received from OpenAI API');
        }
        
        const imageUrl = `data:image/png;base64,${imageBase64}`;
        
        console.log('Image generated successfully');
        return new Response(JSON.stringify({ imageUrl }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        throw new Error('No image was generated in the response');
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        return createErrorResponse('Request timed out. Please try again.', 408, 'TIMEOUT');
      }
      
      throw error;
    }
  } catch (error: any) {
    console.error('Image generation error:', error);
    
    // Return appropriate error response based on error type
    if (error.message?.includes('quota')) {
      return createErrorResponse('API quota exceeded. Please try again later.', 429, 'QUOTA_EXCEEDED');
    } else if (error.message?.includes('rate')) {
      return createErrorResponse('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMITED');
    } else if (error.message?.includes('key')) {
      return createErrorResponse('API key issue. Please check your configuration.', 401, 'OPENAI_API_KEY_INVALID');
    } else if (error.message?.includes('timeout') || error.message?.includes('TIMEOUT')) {
      return createErrorResponse('Request timed out. Please try again.', 408, 'TIMEOUT');
    } else {
      return createErrorResponse(error.message || 'An unexpected error occurred', 500, 'UNKNOWN_ERROR');
    }
  }
});
