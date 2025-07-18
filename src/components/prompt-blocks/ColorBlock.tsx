import React from 'react';
import { motion } from 'framer-motion';

interface ColorBlockProps {
  value: string;
  onChange: (value: string) => void;
}

const colorPalettes = [
  {
    name: 'None',
    colors: ['#000000', '#333333', '#666666', '#999999', '#CCCCCC'],
    description: 'No specific palette'
  },
  {
    name: 'Vibrant',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    description: 'Bold and energetic'
  },
  {
    name: 'Pastel',
    colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF'],
    description: 'Soft and gentle'
  },
  {
    name: 'Monochrome',
    colors: ['#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF'],
    description: 'Black and white'
  },
  {
    name: 'Warm',
    colors: ['#FF8A80', '#FFAB40', '#FFD54F', '#FF7043', '#F06292'],
    description: 'Warm and cozy'
  },
  {
    name: 'Cool',
    colors: ['#81C784', '#4FC3F7', '#BA68C8', '#64B5F6', '#4DB6AC'],
    description: 'Cool and calming'
  },
  {
    name: 'Earth',
    colors: ['#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8', '#EFEBE9'],
    description: 'Natural and organic'
  },
  {
    name: 'Neon',
    colors: ['#FF0080', '#00FF80', '#8000FF', '#FF8000', '#0080FF'],
    description: 'Bright and electric'
  },
];

const ColorBlock: React.FC<ColorBlockProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      {colorPalettes.map((palette) => {
        const isSelected = value === palette.name;
        
        return (
            <motion.button
              key={palette.name}
              onClick={() => onChange(palette.name)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                isSelected 
                  ? 'border-primary bg-accent' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium text-xs ${isSelected ? 'text-accent-foreground' : 'text-foreground'}`}>
                    {palette.name}
                  </h4>
                </div>
                
                {/* Color Swatches */}
                <div className="flex gap-1">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-5 h-5 rounded-md border border-border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </motion.button>
        );
      })}
    </div>
  );
};

export default ColorBlock;