import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./pages/Login";
import Generator from "./components/Generator";

const queryClient = new QueryClient();

const App = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing API key in session storage
    const storedApiKey = sessionStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleLogin = (key: string) => {
    setApiKey(key);
  };

  const handleLogout = () => {
    setApiKey(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {apiKey ? (
          <Generator apiKey={apiKey} onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;