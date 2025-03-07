
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingAnimationProps {
  isLoading: boolean;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ isLoading }) => {
  const [loadingPhrases] = useState([
    "Gathering inspiration...",
    "Capturing imagination...",
    "Crafting pixels...",
    "Drawing masterpiece...",
    "Adding final touches..."
  ]);
  
  const [currentPhrase, setCurrentPhrase] = useState(loadingPhrases[0]);
  
  useEffect(() => {
    if (!isLoading) return;
    
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % loadingPhrases.length;
      setCurrentPhrase(loadingPhrases[index]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isLoading, loadingPhrases]);

  if (!isLoading) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-t-2 border-primary opacity-30 animate-spin-slow"></div>
        <div className="absolute inset-0 rounded-full border-l-2 border-primary opacity-70 animate-spin" style={{ animationDuration: '1.5s' }}></div>
        <div className="absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] w-1.5 h-1.5 rounded-full bg-primary"></div>
      </div>
      
      <div className="text-center transition-all duration-500 ease-in-out">
        <p className="text-lg font-medium text-foreground">{currentPhrase}</p>
        <p className="text-sm text-muted-foreground mt-2">Creating something beautiful takes time</p>
      </div>
    </div>
  );
};

export default LoadingAnimation;
