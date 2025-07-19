import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PromptBuilder from './PromptBuilder';
import ImageResult from './ImageResult';

const Generator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  // Helper function to convert File to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGenerate = async (prompt: string, options: any) => {
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      // Convert reference images to base64 if any
      const referenceImages: string[] = [];
      if (options.referenceImages && options.referenceImages.length > 0) {
        for (const imageFile of options.referenceImages) {
          const base64Image = await convertFileToBase64(imageFile);
          referenceImages.push(base64Image);
        }
      }

      // Call our edge function instead of directly calling OpenAI
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
        throw new Error(error.message || 'Failed to generate image');
      }

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({
          title: "Image Generated!",
          description: "Your AI-generated image is ready."
        });
      } else {
        throw new Error('No image was generated in the response');
      }
    } catch (error: any) {
      console.error('Image generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert aspect ratio to OpenAI supported sizes
  const getSizeFromAspectRatio = (aspectRatio: string): string => {
    switch (aspectRatio) {
      case '1:1':
        return '1024x1024';
      case '2:3':
        return '1024x1536';
      case '3:2':
        return '1536x1024';
      case '9:16':
        return '1024x1792';
      case '16:9':
        return '1792x1024';
      default:
        return '1024x1024';
    }
  };
  return <div className="h-screen flex flex-col bg-gradient-secondary">
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
              <motion.div initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.6
            }}>
                <PromptBuilder onGenerate={handleGenerate} isGenerating={isGenerating} />
              </motion.div>
            </div>
          </div>

          {/* Image Result - Right Side */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <motion.div initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.6,
              delay: 0.2
            }} className="h-full">
                <ImageResult isGenerating={isGenerating} imageUrl={generatedImage} />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Generator;