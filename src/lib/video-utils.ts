import { dbService } from '@/lib/database';
import { Collections, getDatabase } from '@/lib/mongodb';

/**
 * Initialize default video in database if none exists
 */
export async function initializeDefaultVideo() {
  try {
    // Check if there's already a hero background video in the database
    const db = await getDatabase();
    const existingVideo = await db.collection(Collections.MEDIA_ASSETS).findOne({
      section: 'hero-background'
    });

    if (!existingVideo) {
      console.log('📽️ No hero video found, creating default entry...');
      
      // Create a default video entry that points to an external source
      const now = new Date();
      const defaultVideoData = {
        filename: 'default-hero-video.mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'video/mp4',
        section: 'hero-background',
        alt: 'Default hero background video',
        createdAt: now,
        updatedAt: now
      };
      
      const result = await db.collection(Collections.MEDIA_ASSETS).insertOne(defaultVideoData);
      const defaultVideo = {
        ...defaultVideoData,
        _id: result.insertedId.toString(),
        id: result.insertedId.toString()
      };

      // Update the site content to use this video
      await dbService.updateSiteContentByKey('hero.backgroundVideo', `/api/media/${defaultVideo.id}`);

      console.log('✅ Default hero video initialized:', defaultVideo.id);
      return defaultVideo;
    }

    return existingVideo;
  } catch (error) {
    console.error('❌ Error initializing default video:', error);
    return null;
  }
}

/**
 * Get all videos from database
 */
export async function getVideosFromDatabase() {
  try {
    const db = await getDatabase();
    const videos = await db.collection(Collections.MEDIA_ASSETS)
      .find({
        type: { $regex: '^video/' }
      })
      .sort({ createdAt: -1 })
      .project({
        _id: 1,
        filename: 1,
        type: 1,
        section: 1,
        createdAt: 1
      })
      .toArray();

    return videos.map((video: any) => ({
      ...video,
      id: video._id?.toString(),
      _id: video._id?.toString(),
      url: `/api/media/${video._id?.toString()}`,
      size: 'Database stored'
    }));
  } catch (error) {
    console.error('Error fetching videos from database:', error);
    return [];
  }
}
