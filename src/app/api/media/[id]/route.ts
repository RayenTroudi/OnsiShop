import { dbService } from '@/lib/appwrite/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // Fetch media asset from database
    const mediaAsset = await dbService.getMediaAssetById(id);

    if (!mediaAsset) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const asset = mediaAsset as any;

    // Check if it's a data URL (base64 encoded)
    if (asset.url.startsWith('data:')) {
      // Extract base64 data
      const [metadata, base64Data] = asset.url.split(',');
      const mimeType = metadata.match(/:(.*?);/)?.[1] || 'video/mp4';
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generate strong ETag for media assets
      const hash = require('crypto').createHash('md5').update(buffer).digest('hex');
      const etag = `"${hash}"`;
      
      // Check if client has cached version
      const ifNoneMatch = request.headers.get('if-none-match');
      if (ifNoneMatch === etag) {
        return new NextResponse(null, { status: 304 });
      }
      
      // Determine cache duration based on media type
      const isVideo = mimeType.startsWith('video/');
      const isImage = mimeType.startsWith('image/');
      const maxAge = isVideo ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days for videos, 7 days for images
      
      // Return media with optimized headers
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': buffer.length.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': `public, max-age=${maxAge}, immutable`, // Long-term caching with immutable flag
          'ETag': etag,
          'Last-Modified': new Date(asset.updatedAt || Date.now()).toUTCString(),
          'Content-Disposition': `inline; filename="${asset.filename}"`,
          'X-Media-Type': isVideo ? 'video' : isImage ? 'image' : 'unknown',
          'X-Cache-Version': '1.1.0'
        },
      });
    } else {
      // If it's a regular URL, redirect to it
      return NextResponse.redirect(asset.url);
    }

  } catch (error) {
    console.error('Error serving media:', error);
    return NextResponse.json({ error: 'Failed to serve media' }, { status: 500 });
  }
}
