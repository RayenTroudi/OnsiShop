/**
 * Utilities for working with UploadThing URLs and migrating from local files
 */

/**
 * Check if a URL is from UploadThing
 */
export function isUploadThingUrl(url: string): boolean {
  return url.includes('uploadthing.com') || url.includes('utfs.io');
}

/**
 * Check if a URL is a local file
 */
export function isLocalUrl(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}

/**
 * Get optimized UploadThing URL with transformations
 */
export function getOptimizedUploadThingUrl(
  url: string, 
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string {
  if (!isUploadThingUrl(url)) {
    return url; // Return as-is if not an UploadThing URL
  }

  const { width, height, quality = 80, format } = options;
  const params = new URLSearchParams();

  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality !== 80) params.set('q', quality.toString());
  if (format) params.set('f', format);

  const hasParams = params.toString();
  return hasParams ? `${url}?${params.toString()}` : url;
}

/**
 * Get video thumbnail from UploadThing video URL
 */
export function getVideoThumbnail(videoUrl: string): string | null {
  if (!isUploadThingUrl(videoUrl)) {
    return null;
  }

  // UploadThing automatically generates thumbnails for videos
  return `${videoUrl}?thumbnail=true`;
}

/**
 * Validate file type for upload endpoints
 */
export function validateFileType(
  fileName: string,
  allowedTypes: string[]
): { valid: boolean; message?: string } {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension) {
    return { valid: false, message: 'File must have an extension' };
  }

  const typeMap: Record<string, string[]> = {
    'image': ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    'video': ['mp4', 'webm', 'mov', 'avi'],
    'document': ['pdf', 'doc', 'docx', 'txt']
  };

  for (const type of allowedTypes) {
    if (typeMap[type]?.includes(extension)) {
      return { valid: true };
    }
  }

  return { 
    valid: false, 
    message: `File type .${extension} is not allowed. Allowed types: ${allowedTypes.join(', ')}` 
  };
}

/**
 * Convert file size to human readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Generate a safe filename for uploads
 */
export function generateSafeFileName(originalName: string): string {
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "");
  
  // Remove special characters and spaces
  const safeName = nameWithoutExt
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  
  const timestamp = Date.now();
  return `${safeName}-${timestamp}.${extension}`;
}

/**
 * Check if upload URL is still valid/accessible
 */
export async function validateUploadUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Failed to validate upload URL:', error);
    return false;
  }
}

/**
 * Migration helper: Replace content with UploadThing URLs
 */
export async function migrateContentToUploadThing(
  content: Record<string, string>
): Promise<Record<string, string>> {
  const migratedContent = { ...content };
  
  for (const [key, value] of Object.entries(content)) {
    if (typeof value === 'string' && isLocalUrl(value)) {
      // This is a local URL that might need migration
      console.log(`🔄 Local URL found for ${key}: ${value}`);
      // You can add specific migration logic here
      // For now, we'll keep the local URLs as fallbacks
    }
  }
  
  return migratedContent;
}

/**
 * Get file extension from URL or filename
 */
export function getFileExtension(urlOrFilename: string): string | null {
  try {
    const url = new URL(urlOrFilename);
    const pathname = url.pathname;
    const extension = pathname.split('.').pop();
    return extension || null;
  } catch {
    // Not a URL, treat as filename
    return urlOrFilename.split('.').pop() || null;
  }
}

/**
 * Determine file type category from extension
 */
export function getFileTypeCategory(extension: string): 'image' | 'video' | 'document' | 'other' {
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
  const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  
  const ext = extension.toLowerCase();
  
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (docExts.includes(ext)) return 'document';
  
  return 'other';
}

/**
 * Create a fallback placeholder for broken images/videos
 */
export function getMediaFallback(type: 'image' | 'video'): string {
  const placeholders = {
    image: '/images/placeholder.jpg',
    video: '/videos/placeholder.mp4'
  };
  
  return placeholders[type] || '/images/placeholder.jpg';
}