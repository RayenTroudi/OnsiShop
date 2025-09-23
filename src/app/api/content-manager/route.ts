import {
    DEFAULT_CONTENT_VALUES,
    initializeDefaultContent,
    migrateLegacyContent,
    normalizeContentKey
} from '@/lib/content-manager';
import { enhancedDbService, getCircuitBreakerStatus } from '@/lib/enhanced-db';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Fetch all content with normalized keys
export async function GET() {
  try {
    // Check circuit breaker status
    const breakerStatus = getCircuitBreakerStatus();
    console.log('🔍 Content Manager Circuit breaker status:', breakerStatus);
    
    // Initialize defaults and migrate legacy content
    await initializeDefaultContent();
    await migrateLegacyContent();
    
    const content = await enhancedDbService.getAllSiteContent() as any[];

    // Convert to key-value object with all defaults included
    const contentMap: Record<string, string> = {};
    
    // Start with defaults
    Object.entries(DEFAULT_CONTENT_VALUES).forEach(([key, value]) => {
      const normalizedKey = normalizeContentKey(key);
      contentMap[normalizedKey] = value;
    });
    
    // Override with database values
    content.forEach(item => {
      const normalizedKey = normalizeContentKey(item.key);
      contentMap[normalizedKey] = item.value;
    });

    return NextResponse.json({
      success: true,
      data: contentMap,
      items: content
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error fetching unified content:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create or update content item
export async function POST(request: NextRequest) {
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  try {
    const { key, value, action } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const normalizedKey = normalizeContentKey(key);
    console.log(`🎬 Updating ${normalizedKey} content key`);

    // Retry logic for database operations
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📝 Upserting content key: ${normalizedKey} (attempt ${attempt})`);
        
        const upsertedContent = await enhancedDbService.upsertSiteContent(normalizedKey, String(value));

        // Revalidate pages on success
        revalidatePath('/');
        revalidatePath('/admin');

        console.log(`✅ Content updated successfully: ${normalizedKey}`);

        return NextResponse.json({
          success: true,
          data: upsertedContent,
          message: `Content "${normalizedKey}" updated successfully`
        });

      } catch (error) {
        lastError = error as Error;
        const isTimeoutError = error instanceof Error && 
          (error.message.includes('timeout') || error.message.includes('timed out'));
        
        console.error(`❌ Content API error (attempt ${attempt}):`, error);
        
        if (attempt < maxRetries && isTimeoutError) {
          const delay = Math.min(1000 * attempt, 3000); // Progressive delay, max 3s
          console.log(`⏳ Retrying content update in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else if (!isTimeoutError) {
          // If it's not a timeout error, don't retry
          break;
        }
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error('Content update failed after all retries');

  } catch (error) {
    console.error('❌ Content API error:', error);
    
    const isCircuitBreakerError = error instanceof Error && 
      error.message.includes('Circuit breaker is OPEN');
    const isTimeoutError = error instanceof Error && 
      (error.message.includes('timeout') || error.message.includes('timed out'));
    
    if (isCircuitBreakerError) {
      return NextResponse.json(
        { 
          error: 'Database temporarily unavailable',
          message: 'The database service is recovering from connection issues. Please try again in a moment.',
          details: 'Circuit breaker is open',
          circuitBreakerOpen: true
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create/update content',
        message: isTimeoutError 
          ? 'Database connection timeout. The content may have been updated. Please refresh the page to verify.'
          : 'An unexpected error occurred while updating content.',
        details: error instanceof Error ? error.message : 'Unknown error',
        retryable: isTimeoutError
      },
      { status: isTimeoutError ? 503 : 500 }
    );
  }
}

// PUT - Batch update content items
export async function PUT(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items must be an array' },
        { status: 400 }
      );
    }

    const updates = await Promise.all(
      items.map(async (item: { key: string; value: string }) => {
        const normalizedKey = normalizeContentKey(item.key);
        
        return await enhancedDbService.upsertSiteContent(normalizedKey, String(item.value));
      })
    );

    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/admin');

    return NextResponse.json({
      success: true,
      updated: updates.length,
      data: updates
    });

  } catch (error) {
    console.error('Error batch updating content:', error);
    return NextResponse.json(
      { error: 'Failed to batch update content' },
      { status: 500 }
    );
  }
}

// DELETE - Delete content item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      );
    }

    const normalizedKey = normalizeContentKey(key);

    await enhancedDbService.deleteSiteContent(normalizedKey);

    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/admin');

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}