import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PromptBuilder from './PromptBuilder';
import ImageResult from './ImageResult';
interface GeneratorProps {
  apiKey: string;
  onLogout: () => void;
}
const Generator: React.FC<GeneratorProps> = ({
  apiKey,
  onLogout
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const {
    toast
  } = useToast();
  const handleGenerate = async (prompt: string, options: any) => {
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: prompt,
          n: 1,
          size: getSizeFromAspectRatio(options.size),
          quality: "standard",
          response_format: "url"
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate image');
      }
      const data = await response.json();
      const imageUrl = data.data[0].url;
      setGeneratedImage(imageUrl);
      toast({
        title: "Image Generated!",
        description: "Your AI-generated image is ready."
      });
    } catch (error: any) {
      console.error('Image generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image. Please check your API key and try again.",
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
      case '3:4':
        return '1024x1792';
      case '4:3':
        return '1792x1024';
      case '9:16':
        return '1024x1792';
      case '16:9':
        return '1792x1024';
      default:
        return '1024x1024';
    }
  };
  const handleLogout = () => {
    sessionStorage.removeItem('openai_api_key');
    onLogout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
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
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
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