import { requireAdmin } from '@/lib/appwrite/auth';
import { uploadFromFormData } from '@/lib/appwrite/storage';
import { UploadService } from '@/lib/uploadService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const user = await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const uploadType = formData.get('uploadType') as string || 'general-media';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images, videos, and PDFs are allowed.' },
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

    console.log(`📤 Uploading file to Appwrite: ${file.name} (${file.size} bytes)`);

    // Upload to Appwrite Storage
    const uploadResult = await uploadFromFormData(formData, 'file');

    console.log(`✅ File uploaded to Appwrite: ${uploadResult.fileId}`);

    // Save upload metadata to database
    const savedUpload = await UploadService.saveUpload({
      fileName: uploadResult.filename,
      fileUrl: uploadResult.url,
      fileSize: uploadResult.fileSize,
      fileType: uploadResult.mimeType,
      uploadedBy: user.id,
      uploadType,
      isPublic: true,
      metadata: JSON.stringify({
        originalName: file.name,
        fileId: uploadResult.fileId,
        tags: [uploadType]
      })
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      fileId: uploadResult.fileId,
      filename: uploadResult.filename,
      size: uploadResult.fileSize,
      type: uploadResult.mimeType,
      uploadId: savedUpload.id,
      message: 'File uploaded successfully to Appwrite Storage'
    });

  } catch (error: any) {
    console.error('❌ File upload error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
