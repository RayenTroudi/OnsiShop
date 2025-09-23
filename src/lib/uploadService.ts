import { Collections, getDatabase } from '@/lib/mongodb';
import type { CreateDocument, Upload } from '@/types/mongodb';
import { Collection } from 'mongodb';

export class UploadService {
  private static async getCollection(): Promise<Collection<Upload>> {
    const db = await getDatabase();
    return db.collection<Upload>(Collections.UPLOADS);
  }

  /**
   * Save upload metadata to database
   */
  static async saveUpload(uploadData: Omit<CreateDocument<Upload>, 'createdAt' | 'updatedAt'>): Promise<Upload> {
    try {
      const collection = await this.getCollection();
      
      const newUpload: CreateDocument<Upload> = {
        ...uploadData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await collection.insertOne(newUpload);
      
      const saved = await collection.findOne({ _id: result.insertedId });
      if (!saved) {
        throw new Error('Failed to retrieve saved upload');
      }

      console.log(`✅ Upload saved to database: ${saved._id}`);
      return saved;
    } catch (error) {
      console.error('❌ Failed to save upload to database:', error);
      throw error;
    }
  }

  /**
   * Get uploads by user ID
   */
  static async getUploadsByUser(userId: string, uploadType?: Upload['uploadType']): Promise<Upload[]> {
    try {
      const collection = await this.getCollection();
      
      const filter: any = { uploadedBy: userId };
      if (uploadType) {
        filter.uploadType = uploadType;
      }

      const uploads = await collection
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray();

      return uploads;
    } catch (error) {
      console.error('❌ Failed to fetch uploads:', error);
      throw error;
    }
  }

  /**
   * Get uploads by type
   */
  static async getUploadsByType(uploadType: Upload['uploadType'], limit?: number): Promise<Upload[]> {
    try {
      const collection = await this.getCollection();
      
      let query = collection.find({ uploadType }).sort({ createdAt: -1 });
      
      if (limit) {
        query = query.limit(limit);
      }

      const uploads = await query.toArray();
      return uploads;
    } catch (error) {
      console.error('❌ Failed to fetch uploads by type:', error);
      throw error;
    }
  }

  /**
   * Get upload by file URL
   */
  static async getUploadByUrl(fileUrl: string): Promise<Upload | null> {
    try {
      const collection = await this.getCollection();
      
      const upload = await collection.findOne({ fileUrl });
      return upload;
    } catch (error) {
      console.error('❌ Failed to fetch upload by URL:', error);
      throw error;
    }
  }

  /**
   * Update upload metadata
   */
  static async updateUpload(uploadId: string, updateData: Partial<Upload>): Promise<Upload | null> {
    try {
      const collection = await this.getCollection();
      
      const result = await collection.findOneAndUpdate(
        { _id: uploadId as any },
        { 
          $set: { 
            ...updateData, 
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      );

      console.log(`✅ Upload updated: ${uploadId}`);
      return result || null;
    } catch (error) {
      console.error('❌ Failed to update upload:', error);
      throw error;
    }
  }

  /**
   * Delete upload record (doesn't delete the actual file from UploadThing)
   */
  static async deleteUpload(uploadId: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      
      const result = await collection.deleteOne({ _id: uploadId as any });
      
      if (result.deletedCount > 0) {
        console.log(`✅ Upload deleted: ${uploadId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to delete upload:', error);
      throw error;
    }
  }

  /**
   * Get recent uploads (for admin dashboard)
   */
  static async getRecentUploads(limit: number = 10): Promise<Upload[]> {
    try {
      const collection = await this.getCollection();
      
      const uploads = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return uploads;
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
      const collection = await this.getCollection();
      
      const [totalUploads, uploadsByType, sizeStats] = await Promise.all([
        collection.countDocuments({}),
        collection.aggregate([
          { $group: { _id: '$uploadType', count: { $sum: 1 } } }
        ]).toArray(),
        collection.aggregate([
          { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
        ]).toArray()
      ]);

      const typeStats: Record<string, number> = {};
      uploadsByType.forEach((item: any) => {
        typeStats[item._id] = item.count;
      });

      return {
        totalUploads,
        uploadsByType: typeStats,
        totalSize: sizeStats[0]?.totalSize || 0
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