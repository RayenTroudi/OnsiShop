import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

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

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 50MB.' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.name);
    const filename = `hero-video-${timestamp}-${randomString}${fileExtension}`;
    
    // Save to public/videos directory
    const filePath = path.join(process.cwd(), 'public', 'videos', filename);
    await writeFile(filePath, buffer);

    // Return the public URL
    const videoUrl = `/videos/${filename}`;

    return NextResponse.json({ 
      success: true, 
      videoUrl: videoUrl,
      message: 'Video uploaded successfully' 
    });

  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload video' 
    }, { status: 500 });
  }
}
