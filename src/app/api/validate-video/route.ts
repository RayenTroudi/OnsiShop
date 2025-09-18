import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');
  
  if (!videoUrl) {
    return NextResponse.json({
      success: false,
      error: 'Video URL is required'
    }, { status: 400 });
  }
  
  try {
    // Basic URL validation
    const url = new URL(videoUrl, request.nextUrl.origin);
    
    // Check if it's a valid video URL format
    const validExtensions = ['.mp4', '.webm', '.ogg'];
    const hasValidExtension = validExtensions.some(ext => 
      url.pathname.toLowerCase().includes(ext)
    );
    
    // Check if URL is accessible (basic fetch test)
    const response = await fetch(url.toString(), {
      method: 'HEAD', // Only get headers, not the full video
      headers: {
        'Range': 'bytes=0-1024' // Just test first few bytes
      }
    });
    
    const contentType = response.headers.get('content-type') || '';
    const contentLength = response.headers.get('content-length');
    const acceptRanges = response.headers.get('accept-ranges');
    
    return NextResponse.json({
      success: true,
      data: {
        url: url.toString(),
        accessible: response.ok,
        status: response.status,
        contentType,
        contentLength,
        acceptRanges,
        hasValidExtension,
        isVideo: contentType.startsWith('video/'),
        size: contentLength ? `${Math.round(parseInt(contentLength) / 1024 / 1024)} MB` : 'Unknown'
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Video validation failed: ${error}`,
      details: {
        url: videoUrl,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
