import { prisma } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // Fetch media asset from database
    const mediaAsset = await (prisma as any).mediaAsset.findUnique({
      where: { id },
      select: {
        url: true,
        type: true,
        filename: true
      }
    });

    if (!mediaAsset) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Check if it's a data URL (base64 encoded)
    if (mediaAsset.url.startsWith('data:')) {
      // Extract base64 data
      const [metadata, base64Data] = mediaAsset.url.split(',');
      const mimeType = metadata.match(/:(.*?);/)?.[1] || 'video/mp4';
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Return video response with proper headers
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': buffer.length.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
          'Content-Disposition': `inline; filename="${mediaAsset.filename}"`,
        },
      });
    } else {
      // If it's a regular URL, redirect to it
      return NextResponse.redirect(mediaAsset.url);
    }

  } catch (error) {
    console.error('Error serving media:', error);
    return NextResponse.json({ error: 'Failed to serve media' }, { status: 500 });
  }
}
