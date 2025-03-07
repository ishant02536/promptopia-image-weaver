
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isGenerating }) => {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "w-full max-w-3xl mx-auto mb-8 transition-all duration-500 ease-in-out",
        "transform group hover:-translate-y-0.5 focus-within:-translate-y-0.5"
      )}
    >
      <div 
        className={cn(
          "glass-panel overflow-hidden rounded-2xl transition-all duration-300",
          "flex items-center px-4 sm:px-6 shadow-lg",
          isFocused ? "ring-2 ring-primary/30" : "hover:ring-1 hover:ring-primary/20"
        )}
      >
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your image..."
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "flex-1 py-5 sm:py-6 bg-transparent border-0",
            "text-foreground placeholder:text-muted-foreground/70",
            "text-base sm:text-lg focus:outline-none",
            "transition-all duration-200 ease-in-out",
            isFocused ? "placeholder:opacity-70" : "placeholder:opacity-50"
          )}
          disabled={isGenerating}
        />
        <Button 
          type="submit" 
          size="lg"
          disabled={!prompt.trim() || isGenerating}
          className={cn(
            "ml-2 rounded-xl px-5 py-6 h-auto",
            "transition-all duration-300 ease-in-out",
            "bg-primary hover:bg-primary/90",
            "text-white font-medium",
            isGenerating ? "opacity-70" : "opacity-100"
          )}
        >
          <Sparkles className="h-5 w-5 mr-2" />
          <span>Generate</span>
        </Button>
      </div>
      <p className="text-xs text-center mt-2 text-muted-foreground opacity-80">
        Type a detailed description for better results
      </p>
    </form>
  );
};

export default PromptInput;
