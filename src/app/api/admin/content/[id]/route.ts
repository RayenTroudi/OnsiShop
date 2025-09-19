import { dbService } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// DELETE - Delete a specific content item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await dbService.deleteSiteContentById(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}