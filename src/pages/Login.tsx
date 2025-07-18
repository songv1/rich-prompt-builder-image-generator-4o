import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface LoginProps {
  onLogin: (apiKey: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store in session storage
    sessionStorage.setItem('openai_api_key', apiKey);
    onLogin(apiKey);
    
    toast({
      title: "Welcome!",
      description: "Successfully logged in. Let's create something amazing!",
    });
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4 shadow-glow">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Image Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Create stunning visuals with intelligent prompt assistance
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="shadow-elegant border-0">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Connect Your API
              </CardTitle>
              <CardDescription>
                Enter your OpenAI API key to start generating images. 
                Your key is stored securely in your browser session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="h-12 text-center font-mono"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Get your API key from{' '}
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      OpenAI Platform
                    </a>
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-5 h-5 mr-2" />
                    </motion.div>
                  ) : (
                    <Sparkles className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? 'Connecting...' : 'Start Creating'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div 
          className="mt-8 grid grid-cols-3 gap-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="space-y-2">
            <div className="w-8 h-8 bg-accent rounded-lg mx-auto flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Smart Prompts</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-accent rounded-lg mx-auto flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Fast Generation</p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 bg-accent rounded-lg mx-auto flex items-center justify-center">
              <Key className="w-4 h-4 text-accent-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Secure & Private</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;