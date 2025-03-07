
import React, { useState, useEffect } from 'react';
import { Download, Expand, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImageDisplayProps {
  imageUrl: string | null;
  prompt: string;
  onRegenerate?: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageUrl,
  prompt,
  onRegenerate,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset loaded state when image url changes
  useEffect(() => {
    setIsLoaded(false);
  }, [imageUrl]);

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Image downloaded successfully');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!imageUrl) return null;

  return (
    <>
      <div 
        className={cn(
          "w-full max-w-3xl mx-auto transition-all duration-500",
          "glass-panel rounded-2xl overflow-hidden",
          "transform hover:shadow-lg",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="relative pt-[75%] sm:pt-[56.25%] w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={prompt}
            onLoad={() => setIsLoaded(true)}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-transform duration-700",
              "hover:scale-[1.02]"
            )}
          />
        </div>
        
        <div className="p-4 sm:p-6 border-t border-border/30">
          <h3 className="font-medium text-base sm:text-lg mb-3 line-clamp-2">{prompt}</h3>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleDownload}
                className="rounded-xl h-10 w-10 bg-background/50 hover:bg-background"
              >
                <Download className="h-5 w-5" />
                <span className="sr-only">Download</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={toggleFullscreen}
                className="rounded-xl h-10 w-10 bg-background/50 hover:bg-background"
              >
                <Expand className="h-5 w-5" />
                <span className="sr-only">View fullscreen</span>
              </Button>
            </div>
            
            {onRegenerate && (
              <Button 
                variant="ghost" 
                onClick={onRegenerate}
                className="text-sm gap-1.5 rounded-xl hover:bg-background/80"
              >
                <RotateCw className="h-4 w-4" />
                <span>Regenerate</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={toggleFullscreen}
        >
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
            <img 
              src={imageUrl} 
              alt={prompt} 
              className="max-w-full max-h-full object-contain" 
              onClick={(e) => e.stopPropagation()}
            />
            <Button 
              className="absolute top-4 right-4 rounded-full"
              size="icon"
              variant="outline"
              onClick={toggleFullscreen}
            >
              <Expand className="h-5 w-5" />
              <span className="sr-only">Close fullscreen</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageDisplay;
