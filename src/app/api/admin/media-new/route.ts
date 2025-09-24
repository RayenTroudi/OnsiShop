import { verifyAuth } from '@/lib/auth';
import { broadcastContentUpdate } from '@/lib/content-stream';
import { simpleDbService } from '@/lib/simple-db';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Fetch all media assets
export async function GET() {
  try {
    const mediaAssets = await simpleDbService.getMediaAssets();

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
    console.log('🚀 MEDIA-NEW API CALLED - Starting upload processing...');
    
    const body = await request.json();
    const { url, section, mediaType, contentKey } = body;

    console.log('📦 Request body received:', JSON.stringify(body, null, 2));
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

    // Get authenticated user
    const user = verifyAuth(request);
    const userId = user ? user.userId : "68cd59c40c1556c8b019d1a8"; // Fallback to default user ID

    console.log('👤 Authentication result:', { hasUser: !!user, userId });

    // Extract file info from UploadThing URL
    const fileName = url.split('/').pop() || 'uploaded-file';
    const fileType = mediaType === 'video' ? 'video/mp4' : 
                    mediaType === 'image' ? 'image/jpeg' : 
                    'application/octet-stream';
    
    // Determine uploadType based on section
    const uploadType = section === 'hero' && mediaType === 'video' ? 'hero-video' : 
                      section === 'hero' && mediaType === 'image' ? 'hero-image' :
                      section === 'promotions' ? 'promotion-image' : 
                      `${section}-${mediaType}`;

    console.log('🔧 Generated upload details:', {
      fileName,
      fileType,
      uploadType
    });

    // For hero videos, clean up old ones first
    if (section === 'hero' && mediaType === 'video') {
      console.log('🧹 Cleaning up old hero videos...');
      await simpleDbService.deleteMediaAssets({
        section: 'hero',
        type: { $regex: '^video/' }
      });
    }
    
    // Create media asset record with complete structure matching user's requirements
    console.log('💾 About to create media asset with data:', {
      fileName,
      fileUrl: url,
      fileSize: 0,
      fileType,
      uploadedBy: userId,
      uploadType,
      isPublic: true,
      metadata: {
        section: section,
        mediaType: mediaType,
        contentKey: contentKey || null,
        uploadedVia: 'UploadThing',
        originalFilename: fileName
      }
    });

    const mediaAsset = await simpleDbService.createMediaAsset({
      fileName: fileName, // Note: Using fileName instead of filename to match user's example
      fileUrl: url,       // Note: Using fileUrl instead of url to match user's example
      fileSize: 0,        // UploadThing doesn't provide size in URL, set to 0 or fetch separately
      fileType: fileType,
      uploadedBy: userId,
      uploadType: uploadType,
      isPublic: true,
      metadata: {
        section: section,
        mediaType: mediaType,
        contentKey: contentKey || null,
        uploadedVia: 'UploadThing',
        originalFilename: fileName
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ Media asset created successfully:', {
      id: mediaAsset._id,
      fileName: mediaAsset.fileName,
      uploadType: mediaAsset.uploadType
    });

    // Update the content key if provided
    if (contentKey) {
      console.log(`📝 Updating content key: ${contentKey}`);
      await simpleDbService.upsertSiteContent(contentKey, url);

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
    await simpleDbService.deleteMediaAssets({ _id: id });

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