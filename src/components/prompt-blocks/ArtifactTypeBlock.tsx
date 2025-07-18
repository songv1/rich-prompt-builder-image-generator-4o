import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Image, Palette, FileImage, Zap, Star } from 'lucide-react';

interface ArtifactTypeBlockProps {
  value: string;
  onChange: (value: string) => void;
}

const artifactTypes = [
  { value: 'Image', label: 'Image', icon: Image, description: 'General purpose image' },
  { value: 'Stock Photo', label: 'Stock Photo', icon: Camera, description: 'Professional photography style' },
  { value: 'Fantasy Illustration', label: 'Fantasy Illustration', icon: Star, description: 'Fantasy and magical artwork' },
  { value: 'Logo', label: 'Logo', icon: Zap, description: 'Brand logos and symbols' },
  { value: 'Poster', label: 'Poster', icon: FileImage, description: 'Marketing and promotional posters' },
  { value: 'Digital Art', label: 'Digital Art', icon: Palette, description: 'Digital artwork and illustrations' },
];

const ArtifactTypeBlock: React.FC<ArtifactTypeBlockProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {artifactTypes.map((type) => {
        const isSelected = value === type.value;
        const Icon = type.icon;
        
        return (
          <motion.button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              isSelected 
                ? 'border-primary bg-accent text-accent-foreground' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className={`w-4 h-4 mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="space-y-1">
              <h4 className={`font-medium text-xs ${isSelected ? 'text-accent-foreground' : 'text-foreground'}`}>
                {type.label}
              </h4>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default ArtifactTypeBlock;