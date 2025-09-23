import { createCacheInvalidationResponse, invalidateContentCache } from '@/lib/cache-invalidation';
import { broadcastContentUpdate } from '@/lib/content-stream';
import { dbService } from '@/lib/database';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all content items
export async function GET() {
  try {
    const contentItems = await dbService.getAllSiteContent();

    return NextResponse.json(contentItems);
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    );
  }
}

// POST - Create new content item
export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json();

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Check if key already exists
    const existing = await dbService.getSiteContentByKey(key);

    if (existing) {
      return NextResponse.json(
        { error: 'Content key already exists' },
        { status: 409 }
      );
    }

    const newContent = await dbService.createSiteContent({ 
      key, 
      value, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    });

    // Revalidate relevant pages
    revalidatePath('/');
    revalidatePath('/admin/content');

    // Broadcast update to connected clients
    broadcastContentUpdate({ [key]: value });

    // Trigger cache invalidation
    await invalidateContentCache([key]);

    return createCacheInvalidationResponse(newContent, {
      keys: ['content_data'],
      patterns: ['content_', 'hero_']
    });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    );
  }
}

// PUT - Update multiple content items
export async function PUT(request: NextRequest) {
  try {
    const { contentItems } = await request.json();

    if (!Array.isArray(contentItems)) {
      return NextResponse.json(
        { error: 'contentItems must be an array' },
        { status: 400 }
      );
    }

    // Update each content item
    const updates = await Promise.all(
      contentItems.map(async (item: any) => {
        if (item.id && item.key && item.value !== undefined) {
          return await dbService.updateSiteContentById(item.id, {
            key: item.key,
            value: item.value
          });
        }
        return null;
      })
    );

    // Revalidate relevant pages
    revalidatePath('/');
    revalidatePath('/admin/content');

    // Broadcast updates to connected clients
    const updatedContentMap = updates
      .filter(item => item !== null)
      .reduce((acc: Record<string, string>, item: any) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>);
    
    broadcastContentUpdate(updatedContentMap);

    // Trigger cache invalidation for updated keys
    const updatedKeys = Object.keys(updatedContentMap);
    await invalidateContentCache(updatedKeys);

    return createCacheInvalidationResponse({ success: true }, {
      keys: ['content_data'],
      patterns: ['content_', 'hero_']
    });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    );
  }
}