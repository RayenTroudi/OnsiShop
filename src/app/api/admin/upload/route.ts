import { requireAdmin } from '@/lib/appwrite/auth';
import { uploadFromFormData } from '@/lib/appwrite/storage';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('Upload request received - Using Appwrite Storage');
  
  const user = await requireAdmin();
  if (!user) {
    console.log('Auth failed');
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  
  console.log('Auth passed');

  try {
    console.log('Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file in form data');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    console.log('File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Check file type
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Check file size (8MB limit for Appwrite storage)
    if (file.size > 8 * 1024 * 1024) {
      console.log('File too large:', file.size);
      return NextResponse.json({ error: 'File size must be less than 8MB' }, { status: 400 });
    }

    console.log('Uploading file to Appwrite Storage...');
    
    // Upload to Appwrite Storage
    const uploadResult = await uploadFromFormData(formData, 'file');
    
    console.log('File uploaded to Appwrite successfully:', uploadResult.fileId);
    
    console.log('Upload completed:', {
      originalName: file.name,
      type: file.type,
      size: file.size,
      fileId: uploadResult.fileId,
      url: uploadResult.url
    });

    return NextResponse.json({ 
      url: uploadResult.url,
      fileId: uploadResult.fileId,
      filename: uploadResult.filename,
      size: uploadResult.fileSize,
      message: 'File uploaded to Appwrite Storage successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      error: 'Upload failed',
      details: errorMessage 
    }, { status: 500 });
  }
}
