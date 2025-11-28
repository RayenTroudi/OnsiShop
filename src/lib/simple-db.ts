// Deprecated - use Appwrite database
import { dbService } from '@/lib/appwrite/database';

// Simple database service (deprecated - use dbService from @/lib/appwrite/database)
export class SimpleDbService {
  async getAllSiteContent() { return await dbService.getAllSiteContent(); }
  async getSiteContentByKey(key: string) { return await dbService.getSiteContentByKey(key) as any; }
  async upsertSiteContent(key: string, value: string) { return await dbService.upsertSiteContent(key, value); }
  async getMediaAssets() { return await dbService.getMediaAssets(); }
  async createMediaAsset(asset: any) { return await dbService.createMediaAsset(asset); }
  async deleteMediaAssets(ids: string[]) { return await dbService.deleteMediaAssets(ids); }
  async deleteSiteContent(key: string) { return await dbService.deleteSiteContent(key); }
  async getVideoAssets() { const assets = await dbService.getMediaAssets(); return assets.filter((a: any) => a.type?.startsWith('video/')); }
}

export const simpleDbService = new SimpleDbService();
