
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { AlertCircle, ImageOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: (error: string) => void;
  fallback?: React.ReactNode;
}

const SafeImage = forwardRef<HTMLImageElement, SafeImageProps>(({ 
  src, 
  alt, 
  className = '', 
  onError,
  fallback 
}, ref) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);

  useImperativeHandle(ref, () => imgRef as HTMLImageElement);

  const handleError = (error: string) => {
    setHasError(true);
    setIsLoading(false);
    onError?.(error);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = () => {
    handleError('Failed to load image');
  };

  // Validate base64 data
  const isValidBase64Image = (src: string) => {
    if (!src.startsWith('data:image/')) return false;
    try {
      const base64Part = src.split(',')[1];
      if (!base64Part) return false;
      atob(base64Part); // This will throw if invalid base64
      return true;
    } catch {
      return false;
    }
  };

  if (src && !isValidBase64Image(src) && !src.startsWith('http')) {
    handleError('Invalid image source');
  }

  if (hasError) {
    return fallback || (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="text-center p-4">
          <ImageOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Image failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      )}
      <img
        ref={setImgRef}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleImageError}
        className={`w-full h-full object-contain ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
      />
    </div>
  );
});

SafeImage.displayName = 'SafeImage';

export default SafeImage;
