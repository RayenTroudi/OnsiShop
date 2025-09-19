import {
    DEFAULT_CONTENT_VALUES,
    initializeDefaultContent,
    migrateLegacyContent,
    normalizeContentKey,
    prisma
} from '@/lib/content-manager';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Fetch all content with normalized keys
export async function GET() {
  try {
    // Initialize defaults and migrate legacy content
    await initializeDefaultContent();
    await migrateLegacyContent();
    
    const content = await prisma.siteContent.findMany({
      orderBy: { key: 'asc' }
    }) as any[];

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
  try {
    const { key, value } = await request.json();

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    const normalizedKey = normalizeContentKey(key);

    const upsertedContent = await prisma.siteContent.upsert({
      where: { key: normalizedKey },
      update: { value: String(value) },
      create: { key: normalizedKey, value: String(value) }
    });

    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/admin');

    return NextResponse.json({
      success: true,
      data: upsertedContent
    });

  } catch (error) {
    console.error('Error creating/updating content:', error);
    return NextResponse.json(
      { error: 'Failed to create/update content' },
      { status: 500 }
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
        
        return await prisma.siteContent.upsert({
          where: { key: normalizedKey },
          update: { value: String(item.value) },
          create: { key: normalizedKey, value: String(item.value) }
        });
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

    await prisma.siteContent.delete({
      where: { key: normalizedKey }
    });

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