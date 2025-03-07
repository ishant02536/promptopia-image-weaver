
import React, { useState } from 'react';
import { ChevronsUpDown, Settings, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ImageGenerationSettingsProps {
  onChange: (settings: ImageSettings) => void;
  settings: ImageSettings;
}

export interface ImageSettings {
  width: number;
  height: number;
  numResults: number;
  CFGScale?: number;
  steps?: number;
  negativePrompt?: string;
  seed?: number | null;
  useRandomSeed?: boolean;
}

const ImageGenerationSettings: React.FC<ImageGenerationSettingsProps> = ({
  onChange,
  settings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<ImageSettings>({
    ...settings,
    CFGScale: settings.CFGScale || 7,
    steps: settings.steps || 30,
    negativePrompt: settings.negativePrompt || "",
    seed: settings.seed || null,
    useRandomSeed: settings.useRandomSeed !== false
  });

  const handleChange = (setting: keyof ImageSettings, value: any) => {
    const newSettings = { ...localSettings, [setting]: value };
    setLocalSettings(newSettings);
  };

  const handleApply = () => {
    onChange(localSettings);
    setIsOpen(false);
  };

  const resetToDefaults = () => {
    const defaults: ImageSettings = {
      width: 1024,
      height: 1024,
      numResults: 1,
      CFGScale: 7,
      steps: 30,
      negativePrompt: "",
      seed: null,
      useRandomSeed: true
    };
    setLocalSettings(defaults);
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000000);
    handleChange('seed', randomSeed);
  };

  const predefinedSizes = [
    { label: '1:1', width: 1024, height: 1024 },
    { label: '4:3', width: 1024, height: 768 },
    { label: '16:9', width: 1024, height: 576 },
    { label: '9:16', width: 576, height: 1024 },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "rounded-xl bg-background/50 border-border/50 hover:bg-background/80",
            "transition-all duration-300"
          )}
        >
          <Settings className="h-4 w-4 mr-2" />
          <span>Advanced Settings</span>
          <ChevronsUpDown className="h-4 w-4 ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-5 rounded-xl glass-panel backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-base">Image Generation Settings</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={resetToDefaults}
              title="Reset to defaults"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only">Reset</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Image Size</label>
              <span className="text-xs text-muted-foreground">
                {localSettings.width} × {localSettings.height}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {predefinedSizes.map((size) => (
                <Button
                  key={size.label}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-lg text-xs h-8",
                    localSettings.width === size.width && localSettings.height === size.height
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background/50"
                  )}
                  onClick={() => {
                    handleChange('width', size.width);
                    handleChange('height', size.height);
                  }}
                >
                  {size.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Number of Results</label>
              <span className="text-xs text-muted-foreground">{localSettings.numResults}</span>
            </div>
            <Slider
              min={1}
              max={4}
              step={1}
              value={[localSettings.numResults]}
              onValueChange={(value) => handleChange('numResults', value[0])}
              className="py-1"
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">CFG Scale (Prompt Adherence)</label>
              <span className="text-xs text-muted-foreground">{localSettings.CFGScale}</span>
            </div>
            <Slider
              min={1}
              max={10}
              step={0.5}
              value={[localSettings.CFGScale || 7]}
              onValueChange={(value) => handleChange('CFGScale', value[0])}
              className="py-1"
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Generation Steps</label>
              <span className="text-xs text-muted-foreground">{localSettings.steps}</span>
            </div>
            <Slider
              min={10}
              max={50}
              step={5}
              value={[localSettings.steps || 30]}
              onValueChange={(value) => handleChange('steps', value[0])}
              className="py-1"
            />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>Fast</span>
              <span>Balanced</span>
              <span>Detailed</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Negative Prompt</label>
            <div className="mt-1.5">
              <Input
                placeholder="What to avoid in the image"
                value={localSettings.negativePrompt || ''}
                onChange={(e) => handleChange('negativePrompt', e.target.value)}
                className="bg-background/50"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Add concepts you want the AI to avoid (e.g., "blur, low quality")
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Generation Seed</label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="random-seed"
                  checked={localSettings.useRandomSeed}
                  onCheckedChange={(checked) => {
                    handleChange('useRandomSeed', checked);
                    if (checked) {
                      handleChange('seed', null);
                    } else if (localSettings.seed === null) {
                      generateRandomSeed();
                    }
                  }}
                />
                <Label htmlFor="random-seed" className="text-xs">Random</Label>
              </div>
            </div>
            <div className="mt-1.5 flex gap-2">
              <Input
                type="number"
                placeholder="Seed value"
                value={localSettings.seed === null ? '' : localSettings.seed}
                onChange={(e) => handleChange('seed', e.target.value ? parseInt(e.target.value) : null)}
                disabled={localSettings.useRandomSeed}
                className="bg-background/50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={generateRandomSeed}
                disabled={localSettings.useRandomSeed}
                className="bg-background/50"
              >
                Generate
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Same seed produces consistent results with the same prompt
            </p>
          </div>

          <Button 
            onClick={handleApply}
            className="w-full rounded-xl mt-2"
          >
            Apply Settings
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ImageGenerationSettings;
