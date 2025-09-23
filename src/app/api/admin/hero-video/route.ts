import { requireAdmin } from '@/lib/auth';
import { dbService } from '@/lib/database';
import { UploadService } from '@/lib/uploadService';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Fetch current hero video URL
export async function GET(request: NextRequest) {
  try {
    // Get current hero video from site content
    const heroVideoContent = await dbService.getSiteContentByKey('hero_background_video');
    
    return NextResponse.json({
      success: true,
      url: (heroVideoContent as any)?.value || '',
      data: heroVideoContent
    });
  } catch (error) {
    console.error('❌ Error fetching hero video:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch hero video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Update hero video URL (called after UploadThing upload)
export async function POST(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const maxRetries = 3;
  let lastError: Error | null = null;
  
  try {
    const { videoUrl, uploadId, metadata } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Video URL is required' 
        },
        { status: 400 }
      );
    }

    console.log('🎬 Processing hero video update:', { videoUrl, uploadId });

    // Retry logic for database operations
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📝 Updating hero video URL (attempt ${attempt}): ${videoUrl}`);
        
        // Update the site content with the new video URL
        const updatedContent = await dbService.upsertSiteContent('hero_background_video', videoUrl);

        // If we have upload metadata, update the upload record
        if (uploadId && metadata) {
          try {
            await UploadService.updateUpload(uploadId, {
              ...metadata,
              appliedAt: new Date(),
              contentKey: 'hero_background_video'
            });
            console.log('📄 Upload metadata updated:', uploadId);
          } catch (metadataError) {
            console.warn('⚠️ Failed to update upload metadata (non-critical):', metadataError);
            // Don't fail the whole operation if metadata update fails
          }
        }

        // Revalidate pages to update cache
        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/admin/hero-video');

        console.log('✅ Hero video updated successfully:', videoUrl);

        return NextResponse.json({
          success: true,
          message: 'Hero video updated successfully',
          url: videoUrl,
          data: updatedContent,
          appliedAt: new Date().toISOString()
        });

      } catch (error) {
        lastError = error as Error;
        const isTimeoutError = error instanceof Error && 
          (error.message.includes('timeout') || error.message.includes('timed out'));
        
        console.error(`❌ Hero video update error (attempt ${attempt}):`, error);
        
        if (attempt < maxRetries && isTimeoutError) {
          const delay = Math.min(1000 * attempt, 3000); // Progressive delay, max 3s
          console.log(`⏳ Retrying hero video update in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else if (!isTimeoutError) {
          // If it's not a timeout error, don't retry
          break;
        }
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error('Hero video update failed after all retries');

  } catch (error) {
    console.error('❌ Hero video API error:', error);
    
    const isTimeoutError = error instanceof Error && 
      (error.message.includes('timeout') || error.message.includes('timed out'));
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update hero video',
        message: isTimeoutError 
          ? 'Database connection timeout. Your video was uploaded successfully to UploadThing. Please refresh the page to verify the update.'
          : 'An unexpected error occurred while updating the hero video.',
        details: error instanceof Error ? error.message : 'Unknown error',
        retryable: isTimeoutError
      },
      { status: isTimeoutError ? 503 : 500 }
    );
  }
}

// DELETE - Remove hero video
export async function DELETE(request: NextRequest) {
  const authResult = requireAdmin(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    console.log('🗑️ Removing hero video');
    
    // Remove the hero video URL from site content
    await dbService.upsertSiteContent('hero_background_video', '');

    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath('/admin/hero-video');

    console.log('✅ Hero video removed successfully');

    return NextResponse.json({
      success: true,
      message: 'Hero video removed successfully'
    });

  } catch (error) {
    console.error('❌ Error removing hero video:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to remove hero video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}