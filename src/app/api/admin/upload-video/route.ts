import { dbService } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('video') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No video file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only MP4, WebM, AVI, and MOV files are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 20MB for database storage)
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 20MB for database storage.' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert to base64 for database storage
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    // Generate unique filename for reference
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `hero-video-${timestamp}-${randomString}.${file.type.split('/')[1]}`;

    // Store in database
    const mediaAsset = await dbService.createMediaAsset({
      filename,
      url: dataUrl, // Store the complete data URL
      type: file.type,
      section: 'hero-background',
      alt: 'Hero background video'
    });

    if (!mediaAsset) {
      return NextResponse.json({ success: false, error: 'Failed to store media asset' }, { status: 500 });
    }

    console.log('✅ Video stored in database:', {
      id: mediaAsset.id,
      filename,
      size: `${Math.round(file.size / 1024)} KB`,
      type: file.type
    });

    // Return the database asset ID (we'll serve it via API)
    const videoUrl = `/api/media/${mediaAsset.id}`;

    return NextResponse.json({ 
      success: true, 
      videoUrl: videoUrl,
      assetId: mediaAsset.id,
      message: 'Video uploaded and stored in database successfully' 
    });

  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload video' 
    }, { status: 500 });
  }
}
