
import { toast } from "sonner";

// API endpoint for the image generation
const API_ENDPOINT = "https://api.runware.ai/v1";

export interface GenerateImageParams {
  positivePrompt: string;
  model?: string;
  width?: number;
  height?: number;
  numberResults?: number;
  outputFormat?: string;
  CFGScale?: number;
  scheduler?: string;
  strength?: number;
  seed?: number | null;
}

export interface GeneratedImage {
  imageURL: string;
  positivePrompt: string;
  seed: number;
  imageUUID: string;
}

export class ImageGenerationService {
  private apiKey: string | null = null;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
    
    // If apiKey is not provided, prompt the user to input it through localStorage
    if (!apiKey && typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('runware_api_key');
    }
  }
  
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    if (typeof window !== 'undefined') {
      localStorage.setItem('runware_api_key', apiKey);
    }
  }
  
  async generateImage(params: GenerateImageParams): Promise<GeneratedImage | null> {
    if (!this.apiKey) {
      toast.error("API key not found. Please set your API key in settings.");
      return null;
    }
    
    try {
      // Create an array of request objects
      const authTask = {
        taskType: "authentication",
        apiKey: this.apiKey
      };
      
      const imageTask = {
        taskType: "imageInference",
        taskUUID: crypto.randomUUID(),
        positivePrompt: params.positivePrompt,
        model: params.model || "runware:100@1",
        width: params.width || 1024,
        height: params.height || 1024,
        numberResults: params.numberResults || 1,
        outputFormat: params.outputFormat || "WEBP",
        CFGScale: params.CFGScale || 1,
        scheduler: params.scheduler || "FlowMatchEulerDiscreteScheduler",
        strength: params.strength || 0.8,
      };
      
      // Add seed only if it's provided
      if (params.seed !== undefined && params.seed !== null) {
        imageTask.seed = params.seed;
      }
      
      const requestBody = [authTask, imageTask];
      
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate image');
      }
      
      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'An error occurred during image generation');
      }
      
      if (!data.data || data.data.length < 2) {
        throw new Error('No image data received');
      }
      
      const imageData = data.data.find(item => item.taskType === 'imageInference');
      
      if (!imageData || !imageData.imageURL) {
        throw new Error('No image URL found in response');
      }
      
      return {
        imageURL: imageData.imageURL,
        positivePrompt: params.positivePrompt,
        seed: imageData.seed || 0,
        imageUUID: imageData.imageUUID || '',
      };
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error.message || 'Failed to generate image. Please try again.');
      return null;
    }
  }
}

export const imageService = new ImageGenerationService();
