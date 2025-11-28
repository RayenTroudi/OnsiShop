import { verifyAuth } from '@/lib/appwrite/auth';
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

// POST - Save Appwrite Storage URL to content (replaces old base64 upload logic)
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 MEDIA-NEW API CALLED - Starting upload processing...');
    
    const body = await request.json();
    const { url, section, mediaType, contentKey } = body;

    console.log('📦 Request body received:', JSON.stringify(body, null, 2));
    console.log(`📁 Saving Appwrite Storage URL:`);
    console.log(`   URL: ${url}`);
    console.log(`   Section: ${section}`);
    console.log(`   Media Type: ${mediaType}`);
    console.log(`   Content Key: ${contentKey}`);

    if (!url || !url.startsWith('http')) {
      return NextResponse.json(
        { error: 'Valid URL is required' },
        { status: 400 }
      );
    }

    // Validate that it's a proper Appwrite Storage URL
    if (!url.includes('appwrite.io') && !url.includes('/storage/buckets/')) {
      return NextResponse.json(
        { error: 'Only Appwrite Storage URLs are allowed' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const user = await verifyAuth();
    const userId = user ? user.id : "68cd59c40c1556c8b019d1a8"; // Fallback to default user ID

    console.log('👤 Authentication result:', { hasUser: !!user, userId });

    // Extract file info from Appwrite Storage URL
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
      const oldHeroVideos = await simpleDbService.getMediaAssets();
      const heroVideoIds = oldHeroVideos
        .filter((a: any) => a.section === 'hero' && a.type?.startsWith('video/'))
        .map((a: any) => a.id || a.$id);
      if (heroVideoIds.length > 0) {
        await simpleDbService.deleteMediaAssets(heroVideoIds);
      }
    }
    
    // Create media asset record with complete structure matching user's requirements
    console.log('💾 About to create media asset with data:', {
      filename: fileName,
      url: url,
      fileSize: 0,
      type: fileType,
      uploadedBy: userId,
      uploadType,
      isPublic: true,
      section: section,
      metadata: {
        section: section,
        mediaType: mediaType,
        contentKey: contentKey || null,
        uploadedVia: 'Appwrite',
        originalFilename: fileName
      }
    });

    const mediaAsset = await simpleDbService.createMediaAsset({
      filename: fileName,  // Appwrite schema uses 'filename' (lowercase)
      url: url,            // Appwrite schema uses 'url' (not fileUrl)
      fileId: '',          // Optional field for Appwrite file ID
      alt: '',             // Alternative text for accessibility
      type: fileType,      // MIME type
      section: section,    // Section identifier (hero, promotions, etc.)
    });
    
    const asset = mediaAsset as any;
    console.log('✅ Media asset created successfully:', {
      id: asset._id || asset.id || asset.$id,
      filename: asset.filename,
      type: asset.type,
      section: asset.section
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
      message: 'Appwrite Storage URL and media asset saved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error saving Appwrite Storage URL:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
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
    
    // Return detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to save Appwrite Storage URL';
    return NextResponse.json(
      { 
        error: errorMessage,
        message: errorMessage
      },
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
    await simpleDbService.deleteMediaAssets([id]);

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