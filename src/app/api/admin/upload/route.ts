import { requireAdmin } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const fileExtension = path.extname(file.name);
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${Math.random().toString(36).substring(2)}${fileExtension}`;
    
    // Save file to public/uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, uniqueFilename);
    
    await writeFile(filePath, buffer);
    
    // Return the URL path that can be used in the frontend
    const fileUrl = `/uploads/${uniqueFilename}`;
    
    // Log file info for development
    console.log('File uploaded:', {
      name: file.name,
      size: file.size,
      type: file.type,
      savedAs: uniqueFilename,
      url: fileUrl
    });

    return NextResponse.json({ 
      url: fileUrl,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
