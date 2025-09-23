import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "./uploadthing";

// Enhanced UploadThing client with better error handling and retry logic
export const { useUploadThing: useUploadThingBase, uploadFiles: uploadFilesBase } = generateReactHelpers<OurFileRouter>();

// Enhanced upload hook with retry logic and better error handling
export function useUploadThingEnhanced(endpoint: keyof OurFileRouter) {
  const { startUpload, isUploading } = useUploadThingBase(endpoint);

  const enhancedStartUpload = async (files: File[], input?: any) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second
    const TIMEOUT_MS = 30000; // 30 seconds

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`📤 Upload attempt ${attempt}/${MAX_RETRIES} for ${files.length} files`);
        
        // Create a promise that rejects after timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Upload timeout after ${TIMEOUT_MS}ms`));
          }, TIMEOUT_MS);
        });

        // Race between upload and timeout
        const uploadPromise = startUpload(files, input);
        const result = await Promise.race([uploadPromise, timeoutPromise]);

        if (result) {
          console.log(`✅ Upload successful on attempt ${attempt}`);
          return result;
        }
      } catch (error: any) {
        console.error(`❌ Upload attempt ${attempt} failed:`, error);
        
        const isNetworkError = error.message?.includes('Transport error') || 
                              error.message?.includes('Connect Timeout') ||
                              error.message?.includes('fetch failed') ||
                              error.message?.includes('timeout');
        
        if (isNetworkError && attempt < MAX_RETRIES) {
          const delay = RETRY_DELAY * attempt; // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If it's the last attempt or not a network error, throw
        throw new Error(`Upload failed after ${attempt} attempts: ${error.message}`);
      }
    }
    
    throw new Error(`Upload failed after ${MAX_RETRIES} attempts`);
  };

  return {
    startUpload: enhancedStartUpload,
    isUploading
  };
}

// Enhanced uploadFiles function with retry logic
export async function uploadFilesEnhanced(
  endpoint: keyof OurFileRouter,
  files: File[],
  input?: any
) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  const TIMEOUT_MS = 30000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`📤 Direct upload attempt ${attempt}/${MAX_RETRIES}`);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Upload timeout after ${TIMEOUT_MS}ms`));
        }, TIMEOUT_MS);
      });

      // Race between upload and timeout
      const uploadPromise = uploadFilesBase(endpoint, { files });
      const result = await Promise.race([uploadPromise, timeoutPromise]);

      if (result) {
        console.log(`✅ Direct upload successful on attempt ${attempt}`);
        return result;
      }
    } catch (error: any) {
      console.error(`❌ Direct upload attempt ${attempt} failed:`, error);
      
      const isNetworkError = error.message?.includes('Transport error') || 
                            error.message?.includes('Connect Timeout') ||
                            error.message?.includes('fetch failed') ||
                            error.message?.includes('timeout');
      
      if (isNetworkError && attempt < MAX_RETRIES) {
        const delay = RETRY_DELAY * attempt;
        console.log(`⏳ Retrying direct upload in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error(`Direct upload failed after ${MAX_RETRIES} attempts`);
}

// Network connectivity checker
export async function checkUploadThingConnectivity(): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const start = Date.now();
    
    // Test connectivity to UploadThing's API
    const response = await fetch('/api/uploadthing', {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
    const latency = Date.now() - start;
    
    return {
      connected: response.ok,
      latency,
      error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message
    };
  }
}

// UploadThing status checker
export async function getUploadThingStatus(): Promise<{
  service: 'operational' | 'degraded' | 'down';
  message?: string;
}> {
  try {
    // Check if we can reach UploadThing's service
    const connectivity = await checkUploadThingConnectivity();
    
    if (connectivity.connected) {
      return {
        service: connectivity.latency && connectivity.latency > 2000 ? 'degraded' : 'operational',
        message: connectivity.latency ? `Latency: ${connectivity.latency}ms` : undefined
      };
    } else {
      return {
        service: 'down',
        message: connectivity.error || 'Service unreachable'
      };
    }
  } catch (error: any) {
    return {
      service: 'down',
      message: error.message
    };
  }
}