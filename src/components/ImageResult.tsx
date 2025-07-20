import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Sparkles, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import SafeImage from './SafeImage';
import { ErrorHandler } from '@/utils/errorHandling';

interface ImageResultProps {
  isGenerating: boolean;
  imageUrl: string | null;
  onRetry?: () => void;
  generationError?: string;
}

const ImageResult: React.FC<ImageResultProps> = ({ 
  isGenerating, 
  imageUrl, 
  onRetry,
  generationError 
}) => {
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { isOnline } = useNetworkStatus();

  const handleDownload = async () => {
    if (!imageUrl) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      let blob: Blob;
      
      if (imageUrl.startsWith('data:')) {
        // Handle base64 data
        const response = await fetch(imageUrl);
        blob = await response.blob();
      } else {
        // Handle URL
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        blob = await response.blob();
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to download image';
      setDownloadError(errorMessage);
      
      // Fallback: try direct link
      try {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `ai-generated-image-${Date.now()}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadError(null);
      } catch (fallbackError) {
        setDownloadError('Download failed. Please try right-clicking and "Save image as..."');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const clearDownloadError = () => {
    setDownloadError(null);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold">Generated Result</h2>
        <p className="text-sm text-muted-foreground">
          Your AI-generated image will appear here
        </p>
        {!isOnline && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're offline. Please check your internet connection.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {(generationError || downloadError) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {generationError || downloadError}
                <div className="mt-2 flex gap-2">
                  {generationError && onRetry && (
                    <Button variant="outline" size="sm" onClick={onRetry}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Retry
                    </Button>
                  )}
                  {downloadError && (
                    <Button variant="outline" size="sm" onClick={clearDownloadError}>
                      Dismiss
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Area */}
      <div className="flex-1 min-h-0">
        <Card className="overflow-hidden h-full">
          <CardContent className="p-0 h-full">
            <div className="h-full bg-muted relative">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <LoadingAnimation key="loading" />
                ) : imageUrl ? (
                  <ImageDisplay 
                    key="image"
                    imageUrl={imageUrl} 
                    onError={(error) => console.error('Image display error:', error)}
                  />
                ) : (
                  <PlaceholderState key="placeholder" />
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Button */}
      <AnimatePresence>
        {imageUrl && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-shrink-0"
          >
            <Button 
              onClick={handleDownload}
              disabled={isDownloading || !isOnline}
              className="w-full h-10 gap-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              {isDownloading ? 'Downloading...' : 'Download Image'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LoadingAnimation: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-gradient-accent"
    >
      <div className="text-center space-y-4">
        {/* Animated Icon */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-glow"
        >
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </motion.div>

        {/* Loading Text */}
        <div className="space-y-2">
          <motion.h3 
            className="text-lg font-semibold"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            Creating your image...
          </motion.h3>
          <p className="text-sm text-muted-foreground">
            This may take a few moments
          </p>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2 w-48">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="h-1 bg-muted rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-gradient-primary"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

interface ImageDisplayProps {
  imageUrl: string;
  onError?: (error: string) => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  imageUrl,
  onError
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0"
    >
      <SafeImage
        src={imageUrl}
        alt="Generated AI image"
        className="w-full h-full"
        onError={onError}
      />
    </motion.div>
  );
};

const PlaceholderState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center bg-gradient-accent"
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
          <Zap className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Ready to Generate
          </h3>
          <p className="text-sm text-muted-foreground">
            Enter your prompt and click generate to create an image
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageResult;
