import { requireAdmin } from '@/lib/appwrite/auth';
import { uploadFromFormData } from '@/lib/appwrite/storage';
import { UploadService } from '@/lib/uploadService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const user = await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('video') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only MP4, WebM, MOV, and OGG videos are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (32MB max)
    const maxSize = 32 * 1024 * 1024; // 32MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 32MB.' },
        { status: 400 }
      );
    }

    console.log(`📤 Uploading video to Appwrite: ${file.name} (${file.size} bytes)`);

    // Upload to Appwrite Storage
    const uploadResult = await uploadFromFormData(formData, 'video');

    console.log(`✅ Video uploaded to Appwrite: ${uploadResult.fileId}`);

    // Save upload metadata to database
    await UploadService.saveUpload({
      fileName: uploadResult.filename,
      fileUrl: uploadResult.url,
      fileSize: uploadResult.fileSize,
      fileType: uploadResult.mimeType,
      uploadedBy: user.id,
      uploadType: 'hero-video',
      isPublic: true,
      metadata: JSON.stringify({
        originalName: file.name,
        fileId: uploadResult.fileId,
        tags: ['hero', 'video', 'homepage']
      })
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      fileId: uploadResult.fileId,
      filename: uploadResult.filename,
      size: uploadResult.fileSize,
      type: uploadResult.mimeType,
      message: 'Video uploaded successfully to Appwrite Storage'
    });

  } catch (error: any) {
    console.error('❌ Video upload error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload video' },
      { status: 500 }
    );
  }
}
