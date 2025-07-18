import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ReferenceImageBlock from './prompt-blocks/ReferenceImageBlock';
import StyleBlock from './prompt-blocks/StyleBlock';
import SizeBlock from './prompt-blocks/SizeBlock';

import CompositionBlock from './prompt-blocks/CompositionBlock';
import LightingBlock from './prompt-blocks/LightingBlock';
interface PromptBuilderProps {
  onGenerate: (prompt: string, options: PromptOptions) => void;
  isGenerating: boolean;
}
interface PromptOptions {
  referenceImages: File[];
  style: string;
  size: string;
  composition: string;
  lighting: string;
}
const PromptBuilder: React.FC<PromptBuilderProps> = ({
  onGenerate,
  isGenerating
}) => {
  const [prompt, setPrompt] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    reference: true,
    style: false,
    size: false,
    composition: false,
    lighting: false
  });
  const [options, setOptions] = useState<PromptOptions>({
    referenceImages: [],
    style: 'None',
    size: '1:1',
    composition: 'None',
    lighting: 'None'
  });
  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  const updateOption = (key: keyof PromptOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const buildFinalPrompt = () => {
    let finalPrompt = prompt.trim();

    // Add options to prompt
    if (options.style !== 'None') {
      finalPrompt += `, ${options.style} style`;
    }
    if (options.composition !== 'None') {
      finalPrompt += `, ${options.composition} composition`;
    }
    if (options.lighting !== 'None') {
      finalPrompt += `, ${options.lighting} lighting`;
    }
    return finalPrompt || 'A beautiful, high-quality image';
  };
  const handleGenerate = () => {
    const finalPrompt = buildFinalPrompt();
    onGenerate(finalPrompt, options);
  };
  return <div className="space-y-0">
      {/* Header */}
      <div className="text-center space-y-1">
        
        
      </div>

      {/* Main Prompt Input */}
      <Card className="shadow-sm rounded-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Main Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Describe what you want to create..." value={prompt} onChange={e => setPrompt(e.target.value)} className="min-h-[80px] resize-none text-sm" disabled={isGenerating} />
        </CardContent>
      </Card>

      {/* Preview Final Prompt */}
      {prompt && <Card className="bg-accent/50 rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">Final Prompt Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs font-mono bg-muted p-2 rounded-md leading-relaxed">
              {buildFinalPrompt()}
            </p>
          </CardContent>
        </Card>}

      {/* Prompt Blocks */}
      <div className="space-y-0">
        {/* Reference Images - First */}
        <PromptBlock title="Reference Images" isOpen={openSections.reference} onToggle={() => toggleSection('reference')}>
          <ReferenceImageBlock images={options.referenceImages} onChange={value => updateOption('referenceImages', value)} />
        </PromptBlock>

        {/* Aspect Ratio */}
        <PromptBlock title="Aspect Ratio" isOpen={openSections.size} onToggle={() => toggleSection('size')}>
          <SizeBlock value={options.size} onChange={value => updateOption('size', value)} />
        </PromptBlock>

        {/* Style */}
        <PromptBlock title="Style" isOpen={openSections.style} onToggle={() => toggleSection('style')}>
          <StyleBlock value={options.style} onChange={value => updateOption('style', value)} />
        </PromptBlock>


        {/* Composition */}
        <PromptBlock title="Composition" isOpen={openSections.composition} onToggle={() => toggleSection('composition')}>
          <CompositionBlock value={options.composition} onChange={value => updateOption('composition', value)} />
        </PromptBlock>

        {/* Color & Lighting */}
        <PromptBlock title="Color & Lighting" isOpen={openSections.lighting} onToggle={() => toggleSection('lighting')}>
          <LightingBlock value={options.lighting} onChange={value => updateOption('lighting', value)} />
        </PromptBlock>

      </div>

      {/* Generate Button */}
      <motion.div className="mt-6 px-6" whileHover={{
      scale: 1.02
    }} whileTap={{
      scale: 0.98
    }}>
        <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full h-12 text-base bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow py-0 my-[12px]">
          {isGenerating ? <motion.div animate={{
          rotate: 360
        }} transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }} className="mr-2">
              <Sparkles className="w-4 h-4" />
            </motion.div> : <Sparkles className="w-4 h-4 mr-2" />}
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </Button>
      </motion.div>

    </div>;
};
interface PromptBlockProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}
const PromptBlock: React.FC<PromptBlockProps> = ({
  title,
  isOpen,
  onToggle,
  children
}) => {
  return <Card className="shadow-sm rounded-none">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 rounded-none">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{title}</CardTitle>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 rounded-none">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>;
};
export default PromptBuilder;