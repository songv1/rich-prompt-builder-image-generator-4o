import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brush, Sparkles, Camera, Palette, Droplets, Shapes, Box } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StyleBlockProps {
  value: string;
  onChange: (value: string) => void;
}

const presetStyles = [
  { value: 'None', label: 'None', icon: Sparkles, description: 'No specific style' },
  { value: 'Photorealistic', label: 'Photorealistic', icon: Camera, description: 'Realistic photography' },
  { value: 'Flat Illustration', label: 'Flat Illustration', icon: Palette, description: 'Simple, flat design' },
  { value: 'Whimsical 3D', label: 'Whimsical 3D', icon: Box, description: 'Playful 3D style' },
  { value: 'Watercolor', label: 'Watercolor', icon: Droplets, description: 'Paint-like effect' },
  { value: 'Low Poly', label: 'Low Poly', icon: Shapes, description: 'Geometric faceted style' },
];

const StyleBlock: React.FC<StyleBlockProps> = ({ value, onChange }) => {
  const [customStyle, setCustomStyle] = useState('');
  const [isCustom, setIsCustom] = useState(
    !presetStyles.some(style => style.value === value) && value !== 'None'
  );

  const handlePresetSelect = (styleValue: string) => {
    setIsCustom(false);
    onChange(styleValue);
  };

  const handleCustomStyleChange = (customValue: string) => {
    setCustomStyle(customValue);
    setIsCustom(true);
    onChange(customValue);
  };

  const handleCustomToggle = () => {
    if (!isCustom) {
      setIsCustom(true);
      onChange(customStyle);
    } else {
      setIsCustom(false);
      onChange('None');
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset Styles */}
      <div className="grid grid-cols-2 gap-2">
        {presetStyles.map((style) => {
          const isSelected = !isCustom && value === style.value;
          const Icon = style.icon;
          
          return (
            <motion.button
              key={style.value}
              onClick={() => handlePresetSelect(style.value)}
              className={`p-2 rounded-lg border-2 transition-all text-left ${
                isSelected 
                  ? 'border-primary bg-accent text-accent-foreground' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-3 h-3 mb-1 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="space-y-1">
                <h4 className={`font-medium text-xs ${isSelected ? 'text-accent-foreground' : 'text-foreground'}`}>
                  {style.label}
                </h4>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Custom Style */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCustomToggle}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              isCustom 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Custom Style
          </button>
        </div>
        
        {isCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Input
              placeholder="Enter custom style (e.g., 'cyberpunk', 'oil painting')"
              value={customStyle}
              onChange={(e) => handleCustomStyleChange(e.target.value)}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StyleBlock;