import React from 'react';
import { motion } from 'framer-motion';
import { Square, Smartphone, Monitor, Film } from 'lucide-react';

interface SizeBlockProps {
  value: string;
  onChange: (value: string) => void;
}

const aspectRatios = [
  { 
    value: '1:1', 
    label: 'Square', 
    icon: Square, 
    description: '1024x1024',
    dimensions: 'Social media, avatars'
  },
  { 
    value: '3:4', 
    label: 'Portrait', 
    icon: Smartphone, 
    description: '1024x1792',
    dimensions: 'Mobile, stories'
  },
  { 
    value: '4:3', 
    label: 'Landscape', 
    icon: Monitor, 
    description: '1792x1024',
    dimensions: 'Presentations, web'
  },
];

const SizeBlock: React.FC<SizeBlockProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {aspectRatios.map((ratio) => {
        const isSelected = value === ratio.value;
        const Icon = ratio.icon;
        
        return (
          <motion.button
            key={ratio.value}
            onClick={() => onChange(ratio.value)}
            className={`p-3 rounded-lg border-2 transition-all text-left ${
              isSelected 
                ? 'border-primary bg-accent text-accent-foreground' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div>
                  <h4 className={`font-medium text-xs ${isSelected ? 'text-accent-foreground' : 'text-foreground'}`}>
                    {ratio.label}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {ratio.value}
                  </p>
                </div>
              </div>
              <p className="text-xs font-mono text-muted-foreground">
                {ratio.description}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default SizeBlock;