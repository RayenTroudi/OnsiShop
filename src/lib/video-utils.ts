import { prisma } from '@/lib/database';

/**
 * Initialize default video in database if none exists
 */
export async function initializeDefaultVideo() {
  try {
    // Check if there's already a hero background video in the database
    const existingVideo = await (prisma as any).mediaAsset.findFirst({
      where: {
        section: 'hero-background'
      }
    });

    if (!existingVideo) {
      console.log('📽️ No hero video found, creating default entry...');
      
      // Create a default video entry that points to an external source
      const defaultVideo = await (prisma as any).mediaAsset.create({
        data: {
          filename: 'default-hero-video.mp4',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          type: 'video/mp4',
          section: 'hero-background',
          alt: 'Default hero background video'
        }
      });

      // Update the site content to use this video
      await (prisma as any).siteContent.upsert({
        where: { key: 'hero.backgroundVideo' },
        update: { value: `/api/media/${defaultVideo.id}` },
        create: { 
          key: 'hero.backgroundVideo', 
          value: `/api/media/${defaultVideo.id}` 
        }
      });

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
    const videos = await (prisma as any).mediaAsset.findMany({
      where: {
        type: {
          startsWith: 'video/'
        }
      },
      select: {
        id: true,
        filename: true,
        type: true,
        section: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return videos.map((video: any) => ({
      ...video,
      url: `/api/media/${video.id}`,
      size: 'Database stored'
    }));
  } catch (error) {
    console.error('Error fetching videos from database:', error);
    return [];
  }
}
