import React from 'react';
import { motion } from 'framer-motion';
import { Grid3X3, Focus, Move, RotateCw, Maximize2, Eye } from 'lucide-react';

interface CompositionBlockProps {
  value: string;
  onChange: (value: string) => void;
}

const compositions = [
  { 
    value: 'None', 
    label: 'None', 
    icon: Grid3X3, 
    description: 'No specific composition rules' 
  },
  { 
    value: 'Rule of Thirds', 
    label: 'Rule of Thirds', 
    icon: Grid3X3, 
    description: 'Classic composition technique' 
  },
  { 
    value: 'Center Composition', 
    label: 'Centered', 
    icon: Focus, 
    description: 'Subject in the center' 
  },
  { 
    value: 'Dynamic Angle', 
    label: 'Dynamic Angle', 
    icon: RotateCw, 
    description: 'Tilted or angled perspective' 
  },
  { 
    value: 'Close-up', 
    label: 'Close-up', 
    icon: Maximize2, 
    description: 'Tight framing on subject' 
  },
  { 
    value: 'Wide Shot', 
    label: 'Wide Shot', 
    icon: Move, 
    description: 'Broad view with context' 
  },
  { 
    value: 'Birds Eye View', 
    label: 'Bird\'s Eye', 
    icon: Eye, 
    description: 'Top-down perspective' 
  },
  { 
    value: 'Low Angle', 
    label: 'Low Angle', 
    icon: Eye, 
    description: 'Shot from below looking up' 
  },
];

const CompositionBlock: React.FC<CompositionBlockProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {compositions.map((composition) => {
        const isSelected = value === composition.value;
        const Icon = composition.icon;
        
        return (
            <motion.button
              key={composition.value}
              onClick={() => onChange(composition.value)}
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
                  {composition.label}
                </h4>
              </div>
            </motion.button>
        );
      })}
    </div>
  );
};

export default CompositionBlock;