import { connectToDatabase } from './mongodb';

// Simple database service with faster operations
export class SimpleDbService {
  async getAllSiteContent() {
    try {
      console.log('🔍 Simple DB: Fetching all site content...');
      const { db } = await connectToDatabase();
      
      const content = await db.collection('site_content')
        .find({})
        .sort({ key: 1 })
        .limit(100) // Limit results to prevent large queries
        .toArray();
      
      console.log(`✅ Simple DB: Found ${content.length} content items`);
      return content;
    } catch (error) {
      console.error('❌ Simple DB: Failed to get site content:', error);
      throw error;
    }
  }

  async getSiteContentByKey(key: string) {
    try {
      console.log(`🔍 Simple DB: Fetching content for key: ${key}`);
      const { db } = await connectToDatabase();
      
      const content = await db.collection('site_content').findOne({ key });
      console.log(`✅ Simple DB: Content found for ${key}:`, !!content);
      return content;
    } catch (error) {
      console.error(`❌ Simple DB: Failed to get content for key ${key}:`, error);
      throw error;
    }
  }

  async upsertSiteContent(key: string, value: string) {
    try {
      console.log(`🔄 Simple DB: Upserting content for key: ${key}`);
      const { db } = await connectToDatabase();
      
      const now = new Date();
      const result = await db.collection('site_content')
        .findOneAndUpdate(
          { key },
          { 
            $set: { 
              key,
              value,
              updatedAt: now
            },
            $setOnInsert: {
              createdAt: now
            }
          },
          { 
            upsert: true, 
            returnDocument: 'after'
          }
        );
      
      console.log(`✅ Simple DB: Content upserted for ${key}`);
      return result;
    } catch (error) {
      console.error(`❌ Simple DB: Failed to upsert content for key ${key}:`, error);
      throw error;
    }
  }

  async getMediaAssets() {
    try {
      console.log('🔍 Simple DB: Fetching media assets...');
      const { db } = await connectToDatabase();
      
      const assets = await db.collection('media_assets')
        .find({})
        .sort({ createdAt: -1 })
        .limit(50) // Limit to prevent large queries
        .toArray();
      
      console.log(`✅ Simple DB: Found ${assets.length} media assets`);
      return assets;
    } catch (error) {
      console.error('❌ Simple DB: Failed to get media assets:', error);
      throw error;
    }
  }

  async createMediaAsset(asset: any) {
    try {
      console.log('🔄 Simple DB: Creating media asset...');
      console.log('📦 Asset data to insert:', JSON.stringify(asset, null, 2));
      
      const { db } = await connectToDatabase();
      
      const result = await db.collection('media_assets')
        .insertOne({
          ...asset,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      
      console.log('✅ Simple DB: Media asset created with ID:', result.insertedId);
      
      const createdAsset = {
        _id: result.insertedId,
        ...asset
      };
      
      console.log('🎯 Returning media asset:', JSON.stringify(createdAsset, null, 2));
      return createdAsset;
    } catch (error) {
      console.error('❌ Simple DB: Failed to create media asset:', error);
      throw error;
    }
  }

  async deleteMediaAssets(filter: any) {
    try {
      console.log('🔄 Simple DB: Deleting media assets...');
      const { db } = await connectToDatabase();
      
      const result = await db.collection('media_assets').deleteMany(filter);
      console.log(`✅ Simple DB: Deleted ${result.deletedCount} media assets`);
      return result;
    } catch (error) {
      console.error('❌ Simple DB: Failed to delete media assets:', error);
      throw error;
    }
  }

  async deleteSiteContent(key: string) {
    try {
      console.log(`🔄 Simple DB: Deleting content for key: ${key}`);
      const { db } = await connectToDatabase();
      
      const result = await db.collection('site_content').deleteOne({ key });
      console.log(`✅ Simple DB: Content deleted for ${key}`);
      return result;
    } catch (error) {
      console.error(`❌ Simple DB: Failed to delete content for key ${key}:`, error);
      throw error;
    }
  }

  // Get videos specifically for selection
  async getVideoAssets() {
    try {
      console.log('🔍 Simple DB: Fetching video assets...');
      const { db } = await connectToDatabase();
      
      const videos = await db.collection('media_assets')
        .find({ 
          type: { $regex: '^video/' },
          url: { $exists: true, $ne: '' }
        })
        .sort({ createdAt: -1 })
        .toArray();
      
      console.log(`✅ Simple DB: Found ${videos.length} video assets`);
      return videos;
    } catch (error) {
      console.error('❌ Simple DB: Failed to get video assets:', error);
      throw error;
    }
  }
}

// Export simple service instance
export const simpleDbService = new SimpleDbService();