import { prisma } from '@/lib/database';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/content - Fetch all site content
export async function GET() {
  try {
    const content = await (prisma as any).siteContent.findMany({
      select: {
        key: true,
        value: true,
        updatedAt: true
      },
      orderBy: {
        key: 'asc'
      }
    });

    // Convert to key-value object for easier frontend consumption
    const contentMap = content.reduce((acc: Record<string, string>, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      data: contentMap,
      items: content // Also return array format
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch content'
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

    // Update or create each content item
    const updates = await Promise.all(
      Object.entries(content).map(([key, value]) =>
        (prisma as any).siteContent.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        })
      )
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
