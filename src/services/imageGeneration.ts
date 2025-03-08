
import { toast } from "sonner";

// API endpoint for the image generation
const API_ENDPOINT = "https://api.runware.ai/v1";

export interface GenerateImageParams {
  positivePrompt: string;
  negativePrompt?: string;
  model?: string;
  width?: number;
  height?: number;
  numberResults?: number;
  outputFormat?: string;
  CFGScale?: number;
  scheduler?: string;
  strength?: number;
  seed?: number | null;
  steps?: number;
}

export interface GeneratedImage {
  imageURL: string;
  positivePrompt: string;
  negativePrompt?: string;
  seed: number;
  imageUUID: string;
  model?: string;
}

class ImageGenerationService {
  private apiKey: string | null = null;
  private abortController: AbortController | null = null;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || null;
    
    // If apiKey is not provided, check localStorage
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

  getApiKey(): string | null {
    return this.apiKey;
  }
  
  cancelRequest() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
  
  async generateImage(params: GenerateImageParams): Promise<GeneratedImage | null> {
    if (!this.apiKey) {
      toast.error("API key not found. Please set your API key.");
      return null;
    }
    
    try {
      // Cancel any existing request
      this.cancelRequest();
      
      // Create new abort controller for this request
      this.abortController = new AbortController();
      
      // Create the auth task
      const authTask = {
        taskType: "authentication",
        apiKey: this.apiKey
      };
      
      // Enhanced prompt with better descriptor for accuracy
      const enhancedPrompt = this.enhancePrompt(params.positivePrompt);
      
      // Define the image task with optimized parameters for better accuracy
      const imageTask: {
        taskType: string;
        taskUUID: string;
        positivePrompt: string;
        negativePrompt?: string;
        model: string;
        width: number;
        height: number;
        numberResults: number;
        outputFormat: string;
        CFGScale: number;
        scheduler: string;
        strength: number;
        steps?: number;
        seed?: number;
      } = {
        taskType: "imageInference",
        taskUUID: crypto.randomUUID(),
        positivePrompt: enhancedPrompt,
        model: params.model || "runware:100@1",
        width: params.width || 1024,
        height: params.height || 1024,
        numberResults: params.numberResults || 1,
        outputFormat: params.outputFormat || "WEBP",
        CFGScale: params.CFGScale || 9, // Increased from 7 to 9 for better accuracy
        scheduler: params.scheduler || "FlowMatchEulerDiscreteScheduler",
        strength: params.strength || 0.9, // Increased from 0.8 to 0.9 for better accuracy
      };
      
      // Add enhanced negative prompt if not provided
      if (params.negativePrompt) {
        imageTask.negativePrompt = params.negativePrompt;
      } else {
        // Default negative prompt for better quality
        imageTask.negativePrompt = "blurry, distorted, low quality, pixelated, disfigured, deformed, unfocused";
      }
      
      if (params.steps) {
        imageTask.steps = params.steps;
      } else {
        imageTask.steps = 35; // Increased from 30 to 35 for better quality
      }
      
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
        signal: this.abortController.signal
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
        negativePrompt: params.negativePrompt || imageTask.negativePrompt,
        seed: imageResult.seed || 0,
        imageUUID: imageResult.imageUUID || '',
        model: params.model || "runware:100@1"
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Generation request was cancelled');
        return null;
      }
      
      console.error('Error generating image:', error);
      toast.error(error.message || 'Failed to generate image. Please try again.');
      return null;
    } finally {
      this.abortController = null;
    }
  }

  // Helper method to enhance prompts for better accuracy
  private enhancePrompt(originalPrompt: string): string {
    // Don't modify if prompt already seems detailed
    if (originalPrompt.length > 80) return originalPrompt;
    
    // Add quality enhancers for simple prompts
    if (!originalPrompt.toLowerCase().includes('detailed') && 
        !originalPrompt.toLowerCase().includes('high quality')) {
      return `${originalPrompt}, high quality, detailed, realistic, 8k`;
    }
    
    return originalPrompt;
  }
}

export const imageService = new ImageGenerationService();
