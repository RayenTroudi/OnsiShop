import { dbService } from '@/lib/appwrite/database';

/**
 * Initialize default video in database if none exists (deprecated)
 */
export async function initializeDefaultVideo() {
  try {
    // Check if there's already a hero background video in the database
    const existingVideo = await dbService.getSiteContentByKey('hero_background_video');

    if (!existingVideo) {
      console.log('📽️ No hero video found, creating default entry...');
      
      // Create a default video entry using Appwrite
      await dbService.upsertSiteContent(
        'hero_background_video',
        '/videos/1758289257342_CHANEL_Fall-Winter_2019_fashion_film_for_Savoir_Flair__Directed_by_VIVIENNE___TAMAS.mp4'
      );
      
      const defaultVideo = {
        id: 'default-hero-video',
        _id: 'default-hero-video'
      };

      console.log('✅ Default hero video initialized');
      return defaultVideo;
    }

    return existingVideo;
  } catch (error) {
    console.error('❌ Error initializing default video:', error);
    return null;
  }
}

/**
 * Get all videos from database (deprecated - use dbService.getMediaAssets)
 */
export async function getVideosFromDatabase() {
  try {
    const allAssets = await dbService.getMediaAssets();
    const videos = allAssets.filter((asset: any) => asset.type?.startsWith('video/'));

    return videos.map((video: any) => ({
      ...video,
      id: video.id || video.$id,
      _id: video.id || video.$id,
      url: `/api/media/${video.id || video.$id}`,
      size: 'Database stored'
    }));
  } catch (error) {
    console.error('Error fetching videos from database:', error);
    return [];
  }
}
