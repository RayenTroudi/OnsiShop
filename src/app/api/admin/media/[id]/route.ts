import { broadcastContentUpdate } from '@/lib/content-stream';
import { prisma } from '@/lib/database';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// DELETE - Delete a specific media asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Find the media asset to get its details before deletion
    const mediaAsset = await prisma.mediaAsset.findUnique({
      where: { id }
    }) as any;

    if (!mediaAsset) {
      return NextResponse.json(
        { error: 'Media asset not found' },
        { status: 404 }
      );
    }

    // Delete the media asset
    await prisma.mediaAsset.delete({
      where: { id }
    });

    // If this was a hero video, clear the content key
    if (mediaAsset.section === 'hero' && mediaAsset.type && mediaAsset.type.startsWith('video/')) {
      await prisma.siteContent.upsert({
        where: { key: 'hero_background_video' },
        update: { value: '' },
        create: { key: 'hero_background_video', value: '' }
      });

      // Broadcast the update
      broadcastContentUpdate({ hero_background_video: '' });
    }

    // Revalidate pages
    revalidatePath('/');
    revalidatePath('/admin/content');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
}