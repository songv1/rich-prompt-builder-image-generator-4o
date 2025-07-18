import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Lightbulb, Zap, Sunset, CloudSun } from 'lucide-react';

interface LightingBlockProps {
  value: string;
  onChange: (value: string) => void;
}

const lightingOptions = [
  { 
    value: 'None', 
    label: 'None', 
    icon: CloudSun, 
    description: 'Natural ambient lighting' 
  },
  { 
    value: 'Golden Hour', 
    label: 'Golden Hour', 
    icon: Sunset, 
    description: 'Warm, soft lighting' 
  },
  { 
    value: 'Cinematic', 
    label: 'Cinematic', 
    icon: Zap, 
    description: 'Dramatic film-like lighting' 
  },
  { 
    value: 'Soft', 
    label: 'Soft', 
    icon: CloudSun, 
    description: 'Even, diffused light' 
  },
  { 
    value: 'Natural', 
    label: 'Natural', 
    icon: Sun, 
    description: 'Bright daylight' 
  },
  { 
    value: 'Backlit', 
    label: 'Backlit', 
    icon: Sun, 
    description: 'Light from behind subject' 
  },
];

const LightingBlock: React.FC<LightingBlockProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      {lightingOptions.map((lighting) => {
        const isSelected = value === lighting.value;
        const Icon = lighting.icon;
        
        return (
            <motion.button
              key={lighting.value}
              onClick={() => onChange(lighting.value)}
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
                  {lighting.label}
                </h4>
              </div>
            </motion.button>
        );
      })}
    </div>
  );
};

export default LightingBlock;