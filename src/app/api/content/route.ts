import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { 
  prisma, 
  initializeDefaultContent, 
  migrateLegacyContent,
  DEFAULT_CONTENT_VALUES,
  normalizeContentKey
} from '@/lib/content-manager';

export const dynamic = 'force-dynamic';

// GET /api/content - Fetch all site content (legacy endpoint, redirects to new system)
export async function GET() {
  try {
    // Initialize defaults and migrate legacy content
    await initializeDefaultContent();
    await migrateLegacyContent();
    
    const content = await prisma.siteContent.findMany({
      select: {
        key: true,
        value: true,
        updatedAt: true
      },
      orderBy: {
        key: 'asc'
      }
    });

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
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch content',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/content - Create or update content (bulk)
export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'object') {
      return NextResponse.json({
        success: false,
        message: 'Content object is required'
      }, { status: 400 });
    }

    // Update or create each content item with normalized keys
    const updates = await Promise.all(
      Object.entries(content).map(([key, value]) => {
        const normalizedKey = normalizeContentKey(key);
        return prisma.siteContent.upsert({
          where: { key: normalizedKey },
          update: { value: String(value) },
          create: { key: normalizedKey, value: String(value) }
        });
      })
    );

    // Revalidate relevant pages
    revalidatePath('/');
    revalidatePath('/admin/content');

    return NextResponse.json({
      success: true,
      message: 'Content updated successfully',
      data: updates
    });

  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update content'
    }, { status: 500 });
  }
}
