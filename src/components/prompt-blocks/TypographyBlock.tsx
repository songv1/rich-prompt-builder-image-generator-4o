import React from 'react';
import { motion } from 'framer-motion';
import { Type, AlignLeft, Italic, Bold } from 'lucide-react';

interface TypographyBlockProps {
  value: string;
  onChange: (value: string) => void;
}

const typographyOptions = [
  { 
    value: 'None', 
    label: 'None', 
    icon: Type, 
    description: 'No text elements' 
  },
  { 
    value: 'Modern Sans', 
    label: 'Modern Sans', 
    icon: Type, 
    description: 'Clean, contemporary' 
  },
  { 
    value: 'Classic Serif', 
    label: 'Classic Serif', 
    icon: AlignLeft, 
    description: 'Traditional, elegant' 
  },
  { 
    value: 'Bold Display', 
    label: 'Bold Display', 
    icon: Bold, 
    description: 'Strong, impactful' 
  },
  { 
    value: 'Script', 
    label: 'Script', 
    icon: Italic, 
    description: 'Handwritten style' 
  },
  { 
    value: 'Minimal', 
    label: 'Minimal', 
    icon: Type, 
    description: 'Simple, understated' 
  },
  { 
    value: 'Decorative', 
    label: 'Decorative', 
    icon: AlignLeft, 
    description: 'Ornate, artistic' 
  },
  { 
    value: 'Monospace', 
    label: 'Monospace', 
    icon: Type, 
    description: 'Fixed-width, technical' 
  },
];

const TypographyBlock: React.FC<TypographyBlockProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {typographyOptions.map((typography) => {
        const isSelected = value === typography.value;
        const Icon = typography.icon;
        
        return (
            <motion.button
              key={typography.value}
              onClick={() => onChange(typography.value)}
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
                  {typography.label}
                </h4>
              </div>
            </motion.button>
        );
      })}
    </div>
  );
};

export default TypographyBlock;