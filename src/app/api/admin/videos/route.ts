import { getVideosFromDatabase } from '@/lib/video-utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const videos = await getVideosFromDatabase();
    
    return NextResponse.json({
      success: true,
      data: videos,
      count: videos.length
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch videos'
    }, { status: 500 });
  }
}
