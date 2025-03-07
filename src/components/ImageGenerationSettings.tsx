
import React, { useState } from 'react';
import { ChevronsUpDown, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ImageGenerationSettingsProps {
  onChange: (settings: ImageSettings) => void;
  settings: ImageSettings;
}

export interface ImageSettings {
  width: number;
  height: number;
  numResults: number;
}

const ImageGenerationSettings: React.FC<ImageGenerationSettingsProps> = ({
  onChange,
  settings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<ImageSettings>(settings);

  const handleChange = (setting: keyof ImageSettings, value: number) => {
    const newSettings = { ...localSettings, [setting]: value };
    setLocalSettings(newSettings);
  };

  const handleApply = () => {
    onChange(localSettings);
    setIsOpen(false);
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
          <span>Settings</span>
          <ChevronsUpDown className="h-4 w-4 ml-2 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-5 rounded-xl glass-panel backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-base">Image Settings</h3>
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
