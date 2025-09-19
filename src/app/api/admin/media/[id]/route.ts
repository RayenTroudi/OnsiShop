import { broadcastContentUpdate } from '@/lib/content-stream';
import { dbService } from '@/lib/database';
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
    const mediaAsset = await dbService.getMediaAssetById(id);

    if (!mediaAsset) {
      return NextResponse.json(
        { error: 'Media asset not found' },
        { status: 404 }
      );
    }

    // Delete the media asset
    await dbService.deleteMediaAssetById(id);

    // If this was a hero video, clear the content key
    if (mediaAsset && mediaAsset.section === 'hero' && mediaAsset.type && mediaAsset.type.startsWith('video/')) {
      await dbService.upsertSiteContent('hero_background_video', '');

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