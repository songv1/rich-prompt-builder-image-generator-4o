
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { validatePrompt, retryWithBackoff, ErrorHandler, AppError } from '@/utils/errorHandling';
import PromptBuilder from './PromptBuilder';
import ImageResult from './ImageResult';
import ErrorBoundary from './ErrorBoundary';

const Generator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [lastOptions, setLastOptions] = useState<any>(null);
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();

  // Helper function to convert File to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const generateImage = useCallback(async (prompt: string, options: any) => {
    // Validate inputs
    const promptError = validatePrompt(prompt);
    if (promptError) {
      const errorMessage = ErrorHandler.getUserFriendlyMessage(promptError);
      setGenerationError(errorMessage);
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    // Check network connectivity
    if (!isOnline) {
      const errorMessage = 'No internet connection. Please check your connection and try again.';
      setGenerationError(errorMessage);
      toast({
        title: "Network Error",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setGenerationError(null);
    setLastPrompt(prompt);
    setLastOptions(options);

    try {
      // Convert reference images to base64 if any
      const referenceImages: string[] = [];
      if (options.referenceImages && options.referenceImages.length > 0) {
        for (const imageFile of options.referenceImages) {
          try {
            const base64Image = await convertFileToBase64(imageFile);
            referenceImages.push(base64Image);
          } catch (error) {
            console.error('Error converting image to base64:', error);
            throw ErrorHandler.createError('file', 'Failed to process reference image', error instanceof Error ? error.message : 'Unknown error');
          }
        }
      }

      // Call edge function with retry logic
      const result = await retryWithBackoff(async () => {
        const { data, error } = await supabase.functions.invoke('generate-image', {
          body: {
            prompt,
            options: {
              ...options,
              referenceImages
            }
          }
        });

        if (error) {
          // Parse different types of errors
          if (error.message?.includes('quota')) {
            throw ErrorHandler.createError('api', 'API quota exceeded', error.message, 'QUOTA_EXCEEDED');
          } else if (error.message?.includes('rate')) {
            throw ErrorHandler.createError('api', 'Rate limit exceeded', error.message, 'RATE_LIMITED');
          } else if (error.message?.includes('key')) {
            throw ErrorHandler.createError('api', 'API key issue', error.message, 'OPENAI_API_KEY_MISSING');
          } else {
            throw ErrorHandler.createError('api', error.message || 'API error', error.message);
          }
        }

        return data;
      }, 3, 1000);

      if (result?.imageUrl) {
        setGeneratedImage(result.imageUrl);
        toast({
          title: "Image Generated!",
          description: "Your AI-generated image is ready."
        });
      } else {
        throw ErrorHandler.createError('generation', 'No image was generated', 'The API returned an empty response');
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      
      let errorMessage: string;
      if (error.type) {
        // It's our custom AppError
        errorMessage = ErrorHandler.getUserFriendlyMessage(error);
      } else {
        // It's a generic error
        errorMessage = error.message || "Failed to generate image. Please try again.";
      }

      setGenerationError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [isOnline, toast]);

  const handleGenerate = useCallback((prompt: string, options: any) => {
    generateImage(prompt, options);
  }, [generateImage]);

  const handleRetry = useCallback(() => {
    if (lastPrompt && lastOptions) {
      generateImage(lastPrompt, lastOptions);
    }
  }, [lastPrompt, lastOptions, generateImage]);

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-gradient-secondary">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="font-semibold text-lg">AI Image Generator</h1>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Prompt Builder - Left Side */}
            <div className="w-96 border-r bg-card/50 overflow-y-auto">
              <div className="p-0">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ duration: 0.6 }}
                >
                  <ErrorBoundary>
                    <PromptBuilder onGenerate={handleGenerate} isGenerating={isGenerating} />
                  </ErrorBoundary>
                </motion.div>
              </div>
            </div>

            {/* Image Result - Right Side */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full p-6">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ duration: 0.6, delay: 0.2 }} 
                  className="h-full"
                >
                  <ErrorBoundary>
                    <ImageResult 
                      isGenerating={isGenerating} 
                      imageUrl={generatedImage} 
                      onRetry={handleRetry}
                      generationError={generationError}
                    />
                  </ErrorBoundary>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Generator;
