import { broadcastContentUpdate } from '@/lib/content-stream';
import { enhancedDbService, getCircuitBreakerStatus } from '@/lib/enhanced-db';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Fetch all media assets
export async function GET() {
  try {
    // Check circuit breaker status
    const breakerStatus = getCircuitBreakerStatus();
    console.log('🔍 Media API Circuit breaker status:', breakerStatus);
    
    const mediaAssets = await enhancedDbService.getMediaAssets();

    return NextResponse.json(mediaAssets);
  } catch (error) {
    console.error('Error fetching media:', error);
    
    // Check if it's a circuit breaker error
    if (error instanceof Error && error.message.includes('Circuit breaker is OPEN')) {
      return NextResponse.json(
        { 
          error: 'Database temporarily unavailable',
          circuitBreakerOpen: true
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

// POST - Save UploadThing URL to content (replaces old base64 upload logic)
export async function POST(request: NextRequest) {
  try {
    const { url, section, mediaType, contentKey } = await request.json();

    console.log(`📁 Saving UploadThing URL:`);
    console.log(`   URL: ${url}`);
    console.log(`   Section: ${section}`);
    console.log(`   Media Type: ${mediaType}`);
    console.log(`   Content Key: ${contentKey}`);

    if (!url || !url.startsWith('http')) {
      return NextResponse.json(
        { error: 'Valid UploadThing URL is required' },
        { status: 400 }
      );
    }

    // Validate that it's a proper UploadThing URL
    if (!url.includes('uploadthing') && !url.includes('utfs.io')) {
      return NextResponse.json(
        { error: 'Only UploadThing URLs are allowed' },
        { status: 400 }
      );
    }

    // Create media asset record for stats and management
    const fileName = url.split('/').pop() || 'uploaded-file';
    const fileType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
    
    // For hero videos, clean up old ones first
    if (section === 'hero' && mediaType === 'video') {
      console.log('🧹 Cleaning up old hero videos...');
      await enhancedDbService.deleteMediaAssets({
        section: 'hero',
        type: { $regex: '^video/' }
      });
    }
    
    const mediaAsset = await enhancedDbService.createMediaAsset({
      filename: fileName,
      url: url,
      alt: `${section} ${mediaType}`,
      type: fileType,
      section: section || null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('📄 Created media asset record:', mediaAsset._id);

    // Update the content key if provided
    if (contentKey) {
      console.log(`📝 Updating content key: ${contentKey}`);
      await enhancedDbService.upsertSiteContent(contentKey, url);

      // Broadcast the update for real-time updates
      broadcastContentUpdate({ [contentKey]: url });
      console.log(`✅ Successfully updated ${contentKey}`);
    }

    // Revalidate relevant pages
    revalidatePath('/');
    revalidatePath('/admin/content');

    return NextResponse.json({
      success: true,
      url,
      mediaAsset,
      message: 'UploadThing URL and media asset saved successfully'
    });
    
  } catch (error) {
    console.error('Error saving UploadThing URL:', error);
    
    // Check if it's a circuit breaker error
    if (error instanceof Error && error.message.includes('Circuit breaker is OPEN')) {
      return NextResponse.json(
        { 
          error: 'Database temporarily unavailable',
          message: 'The database service is recovering. Please try again in a moment.',
          circuitBreakerOpen: true
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to save UploadThing URL' },
      { status: 500 }
    );
  }
}

// DELETE - Remove media asset
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    // Delete the media asset
    await enhancedDbService.deleteMediaAssets({ _id: id });

    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/admin/content');

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting media:', error);
    
    // Check if it's a circuit breaker error
    if (error instanceof Error && error.message.includes('Circuit breaker is OPEN')) {
      return NextResponse.json(
        { 
          error: 'Database temporarily unavailable',
          circuitBreakerOpen: true
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}