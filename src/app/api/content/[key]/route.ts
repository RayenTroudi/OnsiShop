import { dbService } from '@/lib/database';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    key: string;
  };
}

// GET /api/content/[key] - Fetch single content value
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { key } = params;

    const content = await dbService.getSiteContentByKey(key);

    if (!content) {
      return NextResponse.json({
        success: false,
        message: 'Content not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch content'
    }, { status: 500 });
  }
}

// PUT /api/content/[key] - Update content value (admin-only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { key } = params;
    const { value } = await request.json();

    if (!value && value !== '') {
      return NextResponse.json({
        success: false,
        message: 'Value is required'
      }, { status: 400 });
    }

    // TODO: Add admin authentication check here
    // For now, we'll allow all updates for demo purposes
    
    const content = await dbService.updateSiteContentByKey(key, String(value));

    // Revalidate relevant pages
    revalidatePath('/');
    revalidatePath('/admin/content');

    return NextResponse.json({
      success: true,
      message: 'Content updated successfully',
      data: content
    });

  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update content'
    }, { status: 500 });
  }
}
