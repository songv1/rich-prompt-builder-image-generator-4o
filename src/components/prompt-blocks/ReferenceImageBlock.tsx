
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateFile, ErrorHandler } from '@/utils/errorHandling';

interface ReferenceImageBlockProps {
  images: File[];
  onChange: (images: File[]) => void;
}

const ReferenceImageBlock: React.FC<ReferenceImageBlockProps> = ({ images, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [processingFiles, setProcessingFiles] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setProcessingFiles(true);
    setErrors([]);

    const validFiles: File[] = [];
    const newErrors: string[] = [];

    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${ErrorHandler.getUserFriendlyMessage(error)}`);
      } else {
        validFiles.push(file);
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    const newImages = [...images, ...validFiles].slice(0, 5); // Max 5 images
    onChange(newImages);
    setProcessingFiles(false);

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    
    // Clear errors when removing images
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index} className="text-sm">{error}</div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearErrors}
                  className="mt-2"
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
          processingFiles 
            ? 'border-muted-foreground/20 cursor-not-allowed' 
            : 'border-muted-foreground/30 hover:border-primary/50'
        }`}
        onClick={!processingFiles ? triggerFileSelect : undefined}
      >
        <Upload className={`w-6 h-6 mx-auto mb-1 ${processingFiles ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} />
        <p className="text-xs text-muted-foreground mb-1">
          {processingFiles ? 'Processing files...' : 'Click to upload images'}
        </p>
        <p className="text-xs text-muted-foreground">
          Up to 5 • PNG, JPG, WEBP • Max 5MB each
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        onChange={handleFileSelect}
        disabled={processingFiles}
        className="hidden"
      />

      {/* Image Previews */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-3 md:grid-cols-5 gap-3"
          >
            {images.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group aspect-square"
              >
                <div className="w-full h-full bg-muted rounded-lg overflow-hidden">
                  {file ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => {
                        setErrors(prev => [...prev, `Failed to display ${file.name}`]);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Button */}
      {images.length < 5 && (
        <Button 
          variant="outline" 
          onClick={triggerFileSelect}
          disabled={processingFiles}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {processingFiles ? 'Processing...' : `Add Reference Image (${images.length}/5)`}
        </Button>
      )}
    </div>
  );
};

export default ReferenceImageBlock;
