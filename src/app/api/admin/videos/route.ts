import { simpleDbService } from '@/lib/simple-db';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Get all video assets for selection
export async function GET() {
  try {
    console.log('🎬 Fetching video assets for selection...');
    
    const videos = await simpleDbService.getVideoAssets();
    
    // Also get current hero video from content
    const heroVideoContent = await simpleDbService.getSiteContentByKey('hero_background_video');
    const currentHeroVideo = heroVideoContent?.value || '';
    
    const response = {
      success: true,
      videos: videos.map((video: any) => ({
        id: video._id,
        filename: video.filename,
        url: video.url,
        alt: video.alt,
        section: video.section,
        createdAt: video.createdAt,
        isActive: video.url === currentHeroVideo
      })),
      currentHeroVideo,
      count: videos.length
    };
    
    console.log(`✅ Found ${videos.length} videos, current hero: ${!!currentHeroVideo}`);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Failed to get videos:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch videos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Set a video as the active hero video
export async function POST(request: NextRequest) {
  try {
    const { videoUrl, videoId } = await request.json();
    
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }
    
    console.log(`🎬 Setting hero video to: ${videoUrl}`);
    
    // Update the hero_background_video content key
    await simpleDbService.upsertSiteContent('hero_background_video', videoUrl);
    
    // Revalidate pages to update cache
    revalidatePath('/');
    revalidatePath('/admin');
    
    console.log('✅ Hero video updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Hero video updated successfully',
      videoUrl
    });
    
  } catch (error) {
    console.error('❌ Failed to set hero video:', error);
    return NextResponse.json(
      { 
        error: 'Failed to set hero video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
