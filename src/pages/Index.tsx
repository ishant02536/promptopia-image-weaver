
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PromptInput from '@/components/PromptInput';
import ImageDisplay from '@/components/ImageDisplay';
import LoadingAnimation from '@/components/LoadingAnimation';
import ImageGenerationSettings, { ImageSettings } from '@/components/ImageGenerationSettings';
import { imageService, GeneratedImage } from '@/services/imageGeneration';
import { cn } from '@/lib/utils';

const Index = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [settings, setSettings] = useState<ImageSettings>({
    width: 1024,
    height: 1024,
    numResults: 1,
    CFGScale: 7,
    steps: 30,
    negativePrompt: "",
    seed: null,
    useRandomSeed: true
  });
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('runware_api_key') || '');
  const [showApiInput, setShowApiInput] = useState<boolean>(!localStorage.getItem('runware_api_key'));
  
  // Load image history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('image_history');
    if (savedHistory) {
      try {
        setImageHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse image history from localStorage", e);
      }
    }
  }, []);
  
  // Save generated image to history
  useEffect(() => {
    if (generatedImage) {
      const updatedHistory = [generatedImage, ...imageHistory].slice(0, 10); // Keep only the 10 most recent
      setImageHistory(updatedHistory);
      localStorage.setItem('image_history', JSON.stringify(updatedHistory));
    }
  }, [generatedImage]);

  const handleGenerate = async (inputPrompt: string) => {
    if (!apiKey) {
      toast.error("Please enter your API key");
      setShowApiInput(true);
      return;
    }
    
    if (!inputPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    setPrompt(inputPrompt);
    setIsGenerating(true);
    // Don't clear the previous image immediately for better UX
    
    try {
      imageService.setApiKey(apiKey);
      
      console.log("Starting image generation with prompt:", inputPrompt);
      console.log("Using settings:", settings);
      
      const image = await imageService.generateImage({
        positivePrompt: inputPrompt,
        negativePrompt: settings.negativePrompt,
        width: settings.width,
        height: settings.height,
        numberResults: settings.numResults,
        CFGScale: settings.CFGScale,
        steps: settings.steps,
        seed: settings.useRandomSeed ? null : settings.seed,
      });
      
      console.log("Generation result:", image);
      
      if (image) {
        setGeneratedImage(image);
        toast.success("Image generated successfully!");
      } else {
        toast.error("Failed to generate image. Please check your API key and try again.");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (prompt) {
      handleGenerate(prompt);
    }
  };
  
  const handleSettingsChange = (newSettings: ImageSettings) => {
    setSettings(newSettings);
    toast.info("Settings updated! Next generation will use new settings.");
  };
  
  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('runware_api_key', apiKey);
      imageService.setApiKey(apiKey);
      setShowApiInput(false);
      toast.success("API key saved successfully");
    }
  };
  
  const handleCancelGeneration = () => {
    imageService.cancelRequest();
    setIsGenerating(false);
    toast.info("Image generation cancelled");
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-10 md:py-16">
      <header className="w-full max-w-3xl mx-auto mb-10 sm:mb-16 animate-slide-down">
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            Text to Image
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            Transform Your Words Into Art
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Craft stunning AI-generated images with our modern, intuitive interface
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto">
        <div className="w-full max-w-3xl mx-auto mb-6 flex items-center justify-center gap-3 flex-wrap">
          <ImageGenerationSettings 
            settings={settings} 
            onChange={handleSettingsChange} 
          />
          
          {imageHistory.length > 0 && !showApiInput && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl bg-background/50 border-border/50 hover:bg-background/80"
                onClick={() => {
                  const modal = document.getElementById('image-history-modal') as HTMLDialogElement;
                  if (modal) modal.showModal();
                }}
              >
                History ({imageHistory.length})
              </Button>
              
              <dialog id="image-history-modal" className="modal rounded-xl glass-panel backdrop-blur-md p-0 w-full max-w-3xl">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-lg">Generated Images History</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => {
                        const modal = document.getElementById('image-history-modal') as HTMLDialogElement;
                        if (modal) modal.close();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-1">
                    {imageHistory.map((img, index) => (
                      <div key={index} className="border border-border/30 rounded-lg overflow-hidden hover:shadow-md transition-all">
                        <div className="aspect-square relative overflow-hidden">
                          <img 
                            src={img.imageURL} 
                            alt={img.positivePrompt}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-sm line-clamp-2">{img.positivePrompt}</p>
                          <div className="flex justify-between items-center mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                setPrompt(img.positivePrompt);
                                if (img.negativePrompt) {
                                  setSettings({
                                    ...settings,
                                    negativePrompt: img.negativePrompt
                                  });
                                }
                                const modal = document.getElementById('image-history-modal') as HTMLDialogElement;
                                if (modal) modal.close();
                              }}
                            >
                              Use Prompt
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                // Regenerate with same seed and prompts
                                setPrompt(img.positivePrompt);
                                setSettings({
                                  ...settings,
                                  negativePrompt: img.negativePrompt,
                                  seed: img.seed,
                                  useRandomSeed: false,
                                });
                                setTimeout(() => {
                                  handleGenerate(img.positivePrompt);
                                  const modal = document.getElementById('image-history-modal') as HTMLDialogElement;
                                  if (modal) modal.close();
                                }, 100);
                              }}
                            >
                              Regenerate
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </dialog>
            </div>
          )}
        </div>

        {showApiInput ? (
          <div className="w-full max-w-3xl mx-auto mb-8 animate-fade-in">
            <form onSubmit={handleApiKeySubmit} className="glass-panel rounded-2xl p-6">
              <h3 className="text-lg font-medium mb-3">Enter Runware API Key</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You need an API key from Runware to generate images. Visit{' '}
                <a 
                  href="https://runware.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  runware.ai
                </a>{' '}
                to get your API key.
              </p>
              
              <div className="flex gap-3">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-xxxxxxxxxxxxxxxx"
                  className="flex-1 px-4 py-2 rounded-xl border border-border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <Button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                >
                  Save Key
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <PromptInput onSubmit={handleGenerate} isGenerating={isGenerating} />
        )}

        {isGenerating ? (
          <div className="relative">
            <LoadingAnimation isLoading={isGenerating} />
            <Button
              variant="outline"
              className="absolute top-4 right-4 rounded-xl bg-background/70"
              onClick={handleCancelGeneration}
            >
              Cancel
            </Button>
          </div>
        ) : (
          generatedImage && <ImageDisplay 
            imageUrl={generatedImage.imageURL} 
            prompt={generatedImage.positivePrompt} 
            onRegenerate={handleRegenerate}
          />
        )}
      </main>

      <footer className="mt-auto pt-8 pb-4">
        <div className="container text-center text-sm text-muted-foreground">
          <p>@ Developed By Ishant</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
