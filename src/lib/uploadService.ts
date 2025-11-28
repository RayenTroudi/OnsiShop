import { COLLECTION_IDS, appwriteConfig } from '@/lib/appwrite/config';
import { ID, serverDatabases } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';

const databaseId = appwriteConfig.databaseId;

export class UploadService {
  /**
   * Save upload metadata to database (Appwrite Storage)
   */
  static async saveUpload(uploadData: any): Promise<any> {
    try {
      // Convert metadata object to JSON string for Appwrite
      const dataToSave = {
        ...uploadData,
        metadata: typeof uploadData.metadata === 'object' 
          ? JSON.stringify(uploadData.metadata) 
          : uploadData.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const doc = await serverDatabases.createDocument(
        databaseId,
        COLLECTION_IDS.UPLOADS,
        ID.unique(),
        dataToSave
      );

      console.log(`✅ Upload saved to database: ${doc.$id}`);
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
        metadata: typeof doc.metadata === 'string' 
          ? JSON.parse(doc.metadata) 
          : doc.metadata,
      };
    } catch (error) {
      console.error('❌ Failed to save upload to database:', error);
      throw error;
    }
  }

  /**
   * Get uploads by user ID
   */
  static async getUploadsByUser(userId: string, uploadType?: string): Promise<any[]> {
    try {
      const queries = [Query.equal('uploadedBy', userId)];
      
      if (uploadType) {
        queries.push(Query.equal('uploadType', uploadType));
      }

      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.UPLOADS,
        [...queries, Query.orderDesc('createdAt')]
      );

      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('❌ Failed to fetch uploads:', error);
      throw error;
    }
  }

  /**
   * Get uploads by type
   */
  static async getUploadsByType(uploadType: string, limit?: number): Promise<any[]> {
    try {
      const queries = [Query.equal('uploadType', uploadType), Query.orderDesc('createdAt')];
      
      if (limit) {
        queries.push(Query.limit(limit));
      }

      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.UPLOADS,
        queries
      );

      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('❌ Failed to fetch uploads by type:', error);
      throw error;
    }
  }

  /**
   * Get upload by file URL
   */
  static async getUploadByUrl(fileUrl: string): Promise<any | null> {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.UPLOADS,
        [Query.equal('fileUrl', fileUrl)]
      );
      
      if (response.documents.length === 0) return null;
      
      const doc = response.documents[0];
      if (!doc) return null;
      
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('❌ Failed to fetch upload by URL:', error);
      throw error;
    }
  }

  /**
   * Update upload metadata
   */
  static async updateUpload(uploadId: string, updateData: any): Promise<any | null> {
    try {
      const doc = await serverDatabases.updateDocument(
        databaseId,
        COLLECTION_IDS.UPLOADS,
        uploadId,
        {
          ...updateData,
          updatedAt: new Date().toISOString(),
        }
      );

      console.log(`✅ Upload updated: ${uploadId}`);
      return {
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      };
    } catch (error) {
      console.error('❌ Failed to update upload:', error);
      throw error;
    }
  }

  /**
   * Delete upload record (doesn't delete the actual file from Appwrite Storage)
   */
  static async deleteUpload(uploadId: string): Promise<boolean> {
    try {
      await serverDatabases.deleteDocument(
        databaseId,
        COLLECTION_IDS.UPLOADS,
        uploadId
      );
      
      console.log(`✅ Upload deleted: ${uploadId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete upload:', error);
      return false;
    }
  }

  /**
   * Get recent uploads (for admin dashboard)
   */
  static async getRecentUploads(limit: number = 10): Promise<any[]> {
    try {
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.UPLOADS,
        [Query.orderDesc('createdAt'), Query.limit(limit)]
      );

      return response.documents.map(doc => ({
        ...doc,
        id: doc.$id,
        _id: doc.$id,
      }));
    } catch (error) {
      console.error('❌ Failed to fetch recent uploads:', error);
      throw error;
    }
  }

  /**
   * Get upload statistics
   */
  static async getUploadStats(): Promise<{
    totalUploads: number;
    uploadsByType: Record<string, number>;
    totalSize: number;
  }> {
    try {
      // Get all uploads
      const response = await serverDatabases.listDocuments(
        databaseId,
        COLLECTION_IDS.UPLOADS,
        [Query.limit(10000)]
      );

      const totalUploads = response.total;
      const uploadsByType: Record<string, number> = {};
      let totalSize = 0;

      response.documents.forEach((doc: any) => {
        const type = doc.uploadType || 'unknown';
        uploadsByType[type] = (uploadsByType[type] || 0) + 1;
        totalSize += doc.fileSize || 0;
      });

      return {
        totalUploads,
        uploadsByType,
        totalSize
      };
    } catch (error) {
      console.error('❌ Failed to fetch upload stats:', error);
      throw error;
    }
  }
}

/**
 * Utility function to format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Utility function to get file type from file name
 */
export function getFileTypeFromName(fileName: string): 'image' | 'video' | 'document' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
    return 'image';
  }
  
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '')) {
    return 'video';
  }
  
  if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
    return 'document';
  }
  
  return 'other';
}