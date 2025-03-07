
import React, { useState } from 'react';
import { toast } from 'sonner';
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
  const [settings, setSettings] = useState<ImageSettings>({
    width: 1024,
    height: 1024,
    numResults: 1,
  });
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('runware_api_key') || '');
  const [showApiInput, setShowApiInput] = useState<boolean>(!localStorage.getItem('runware_api_key'));

  const handleGenerate = async (inputPrompt: string) => {
    if (!apiKey) {
      toast.error("Please enter your API key");
      setShowApiInput(true);
      return;
    }
    
    setPrompt(inputPrompt);
    setIsGenerating(true);
    setGeneratedImage(null);
    
    try {
      imageService.setApiKey(apiKey);
      
      console.log("Starting image generation with prompt:", inputPrompt);
      
      const image = await imageService.generateImage({
        positivePrompt: inputPrompt,
        width: settings.width,
        height: settings.height,
        numberResults: settings.numResults,
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
            Craft stunning visuals from your imagination with our AI image generator
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto">
        <div className="w-full max-w-3xl mx-auto mb-6 flex items-center justify-center">
          <ImageGenerationSettings 
            settings={settings} 
            onChange={handleSettingsChange} 
          />
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
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                >
                  Save Key
                </button>
              </div>
            </form>
          </div>
        ) : (
          <PromptInput onSubmit={handleGenerate} isGenerating={isGenerating} />
        )}

        {isGenerating ? (
          <LoadingAnimation isLoading={isGenerating} />
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
