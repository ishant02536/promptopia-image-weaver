
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
      // Create the auth task
      const authTask = {
        taskType: "authentication",
        apiKey: this.apiKey
      };
      
      // Define the image task with TypeScript type that includes optional seed
      const imageTask: {
        taskType: string;
        taskUUID: string;
        positivePrompt: string;
        model: string;
        width: number;
        height: number;
        numberResults: number;
        outputFormat: string;
        CFGScale: number;
        scheduler: string;
        strength: number;
        seed?: number;
      } = {
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
      
      console.log("Sending request to Runware API:", JSON.stringify(requestBody));
      
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API request failed:", errorData);
        throw new Error(errorData.message || 'Failed to generate image');
      }
      
      const data = await response.json();
      console.log("Received response from Runware API:", data);
      
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error("Invalid API response format:", data);
        throw new Error('Invalid response format from API');
      }
      
      // Find the imageInference result in the data array
      const imageResult = data.data.find((item: any) => 
        item.taskType === 'imageInference' && item.imageURL
      );
      
      if (!imageResult) {
        console.error("No image result found in response:", data);
        
        // Check if there's an error message in the response
        const errorMessage = data.errors?.[0]?.message || 
                            data.data.find((item: any) => item.error)?.errorMessage || 
                            'No image generated. Please try again.';
        
        throw new Error(errorMessage);
      }
      
      // Extract the image data from the response
      return {
        imageURL: imageResult.imageURL,
        positivePrompt: params.positivePrompt,
        seed: imageResult.seed || 0,
        imageUUID: imageResult.imageUUID || '',
      };
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast.error(error.message || 'Failed to generate image. Please try again.');
      return null;
    }
  }
}

export const imageService = new ImageGenerationService();
