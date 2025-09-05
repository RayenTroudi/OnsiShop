import { requireAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔄 Upload request received');
  
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    console.log('❌ Auth failed');
    return authResult;
  }
  
  console.log('✅ Auth passed');

  try {
    console.log('📝 Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('❌ No file in form data');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    console.log('📁 File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Check file type
    if (!file.type.startsWith('image/')) {
      console.log('❌ Invalid file type:', file.type);
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Check file size (5MB limit for base64 storage)
    if (file.size > 5 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      return NextResponse.json({ error: 'File size must be less than 5MB for database storage' }, { status: 400 });
    }

    console.log('🔄 Converting file to base64...');
    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    
    // Create data URL with mime type
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    console.log('✅ File converted to base64 successfully');
    console.log('� Data URL size:', dataUrl.length, 'characters');
    
    console.log('🎉 Upload completed:', {
      originalName: file.name,
      type: file.type,
      size: file.size,
      base64Size: dataUrl.length
    });

    return NextResponse.json({ 
      url: dataUrl,
      message: 'File uploaded and converted to base64 successfully'
    });
  } catch (error) {
    console.error('💥 Upload error:', error);
    
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ 
      error: 'Upload failed',
      details: errorMessage 
    }, { status: 500 });
  }
}
