import { requireAdmin } from '@/lib/appwrite/auth';
import { uploadFromFormData } from '@/lib/appwrite/storage';
import { UploadService } from '@/lib/uploadService';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const user = await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (8MB max)
    const maxSize = 8 * 1024 * 1024; // 8MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 8MB.' },
        { status: 400 }
      );
    }

    console.log(`📤 Uploading image to Appwrite: ${file.name} (${file.size} bytes)`);

    // Upload to Appwrite Storage
    const uploadResult = await uploadFromFormData(formData, 'image');

    console.log(`✅ Image uploaded to Appwrite: ${uploadResult.fileId}`);

    // Save upload metadata to database
    await UploadService.saveUpload({
      fileName: uploadResult.filename,
      fileUrl: uploadResult.url,
      fileSize: uploadResult.fileSize,
      fileType: uploadResult.mimeType,
      uploadedBy: user.id,
      uploadType: 'product-image',
      isPublic: true,
      metadata: JSON.stringify({
        originalName: file.name,
        fileId: uploadResult.fileId,
        tags: ['product', 'image']
      })
    });

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      fileId: uploadResult.fileId,
      filename: uploadResult.filename,
      size: uploadResult.fileSize,
      type: uploadResult.mimeType,
      message: 'Image uploaded successfully to Appwrite Storage'
    });

  } catch (error: any) {
    console.error('❌ Image upload error:', error);
    
    if (error.message === 'Unauthorized' || error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
