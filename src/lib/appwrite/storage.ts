import { appwriteConfig } from './config';
import { ID, serverStorage } from './server';

const bucketId = appwriteConfig.bucketId;

export interface UploadResult {
  fileId: string;
  url: string;
  filename: string;
  fileSize: number;
  mimeType: string;
}

/**
 * Upload a file to Appwrite Storage from Buffer
 * @param buffer - File buffer
 * @param filename - Name of the file
 * @param mimeType - MIME type of the file
 * @returns Upload result with fileId and URL
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadResult> {
  try {
    const fileId = ID.unique();
    
    // Create File from buffer for Appwrite
    const file = new File([buffer], filename, { type: mimeType });
    
    const result = await serverStorage.createFile(
      bucketId,
      fileId,
      file as any
    );
    
    // Construct public URL
    const url = `${appwriteConfig.endpoint}/storage/buckets/${bucketId}/files/${result.$id}/view?project=${appwriteConfig.projectId}`;
    
    console.log(`✅ File uploaded to Appwrite: ${result.$id}`);
    
    return {
      fileId: result.$id,
      url,
      filename: result.name,
      fileSize: result.sizeOriginal,
      mimeType: result.mimeType,
    };
  } catch (error) {
    console.error('❌ Error uploading file to Appwrite:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Upload file from FormData (for API routes)
 * @param formData - FormData containing the file
 * @param fileKey - Key of the file in FormData (default: 'file')
 * @returns Upload result
 */
export async function uploadFromFormData(
  formData: FormData,
  fileKey: string = 'file'
): Promise<UploadResult> {
  const file = formData.get(fileKey) as File;
  
  if (!file) {
    throw new Error('No file found in form data');
  }

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return uploadFile(buffer, file.name, file.type);
}

/**
 * Delete a file from Appwrite Storage
 * @param fileId - ID of the file to delete
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    await serverStorage.deleteFile(bucketId, fileId);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * Get file URL from Appwrite Storage
 * @param fileId - ID of the file
 * @returns Public URL of the file
 */
export function getFileUrl(fileId: string): string {
  return `${appwriteConfig.endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${appwriteConfig.projectId}`;
}

/**
 * Get file preview URL (for images with transformations)
 * @param fileId - ID of the file
 * @param width - Preview width
 * @param height - Preview height
 * @returns Preview URL
 */
export function getFilePreviewUrl(fileId: string, width: number = 400, height: number = 400): string {
  return `${appwriteConfig.endpoint}/storage/buckets/${bucketId}/files/${fileId}/preview?width=${width}&height=${height}&project=${appwriteConfig.projectId}`;
}

/**
 * Extract file ID from Appwrite URL
 * @param url - Appwrite file URL
 * @returns File ID or null if not an Appwrite URL
 */
export function extractFileIdFromUrl(url: string): string | null {
  try {
    if (!url.includes('appwrite.io') && !url.includes('/storage/buckets/')) {
      return null;
    }
    
    // URL format: https://fra.cloud.appwrite.io/v1/storage/buckets/{bucketId}/files/{fileId}/view?project={projectId}
    const match = url.match(/\/files\/([a-zA-Z0-9_-]+)\/(view|preview)/);
    return match?.[1] ?? null;
  } catch (error) {
    console.error('Error extracting file ID from URL:', error);
    return null;
  }
}

/**
 * Delete file by URL (extracts file ID and deletes)
 * @param url - Appwrite file URL
 * @returns True if deleted successfully
 */
export async function deleteFileByUrl(url: string): Promise<boolean> {
  const fileId = extractFileIdFromUrl(url);
  if (!fileId) {
    console.warn('Cannot extract file ID from URL:', url);
    return false;
  }
  
  try {
    await deleteFile(fileId);
    return true;
  } catch (error) {
    console.error('Error deleting file by URL:', error);
    return false;
  }
}
