import { broadcastContentUpdate } from '@/lib/content-stream';
import { dbService } from '@/lib/database';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch all media assets
export async function GET() {
  try {
    const mediaAssets = await dbService.getMediaAssets();

    return NextResponse.json(mediaAssets);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    );
  }
}

// POST - Upload new media asset
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const section = formData.get('section') as string;
    const alt = formData.get('alt') as string;

    // Log upload details for debugging
    console.log(`📁 Media Upload Started:`);
    console.log(`   File: ${file?.name}`);
    console.log(`   Type: ${file?.type}`);
    console.log(`   Section: ${section}`);
    console.log(`   Size: ${file ? (file.size / 1024).toFixed(0) : 'unknown'} KB`);

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and videos are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size based on type and section
    let maxSize: number;
    const isHeroVideo = section === 'hero' && file.type.startsWith('video/');
    
    if (file.type.startsWith('video/')) {
      // Hero videos get more restrictive size limits for better performance
      maxSize = isHeroVideo ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for hero videos, 10MB for others
    } else if (file.type.startsWith('image/')) {
      maxSize = 5 * 1024 * 1024; // 5MB for images
    } else {
      maxSize = 5 * 1024 * 1024; // 5MB for other files
    }

    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      const fileType = file.type.split('/')[0];
      const sectionNote = isHeroVideo ? ' (hero background videos are limited to 5MB for optimal performance)' : '';
      return NextResponse.json(
        { 
          error: `File too large. Maximum size is ${sizeMB}MB for ${fileType} files${sectionNote}.`,
          details: `Current file size: ${Math.round(file.size / (1024 * 1024) * 100) / 100}MB`
        },
        { status: 400 }
      );
    }

    // Additional validation for hero videos
    if (isHeroVideo) {
      // Check video duration if possible (this is a basic check)
      // For more advanced validation, you could use a library like ffprobe
      const recommendedFormats = ['video/mp4', 'video/webm'];
      if (!recommendedFormats.includes(file.type)) {
        return NextResponse.json(
          { 
            error: 'For hero videos, MP4 or WebM format is recommended for best compatibility.',
            details: `Current format: ${file.type}`
          },
          { status: 400 }
        );
      }
    }

    // For large files (over 5MB), we need to handle differently
    let mediaUrl: string;
    let shouldStoreInDB = file.size <= 5 * 1024 * 1024; // Store in DB only if under 5MB

    if (shouldStoreInDB) {
      // Convert smaller files to base64 for database storage
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        mediaUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
      } catch (error) {
        console.error('Error converting file to base64:', error);
        return NextResponse.json(
          { error: 'Failed to process file. File may be too large or corrupted.' },
          { status: 500 }
        );
      }
    } else {
      // For larger files, we'll need to implement file system storage or external storage
      // For now, return an error suggesting smaller file size
      return NextResponse.json(
        { 
          error: `File too large for database storage. Please use a file smaller than 5MB or contact support for large file upload options.`,
          details: `Current file size: ${Math.round(file.size / (1024 * 1024) * 100) / 100}MB`
        },
        { status: 413 }
      );
    }

    // For hero videos only, clean up old hero videos FIRST before creating new one
    if (isHeroVideo) {
        console.log('🧹 Cleaning up old hero videos before uploading new one...');
      // Delete old hero videos BEFORE creating new one (ONLY for hero section)
      const deletedVideos = await dbService.deleteMediaAssets({
        section: 'hero',
        type: { startsWith: 'video/' }
      });
      console.log(`🗑️ Deleted ${deletedVideos.count} old hero videos`);
      
      // IMPORTANT: Do NOT delete hero video content from SiteContent table
      // We only delete the MediaAsset records, not the SiteContent
    }

    // Create media asset record
    const mediaAsset = await dbService.createMediaAsset({
      filename: file.name,
      url: mediaUrl,
      alt: alt || null,
      type: file.type,
      section: section || null
    });

    // Revalidate relevant pages when media is uploaded
    revalidatePath('/');
    revalidatePath('/admin/content');

    // Update content keys after successful creation - ONLY update the specific section
    let contentKey: string | null = null;
    
    if (isHeroVideo) {
      // ONLY update hero video content key for hero videos
      contentKey = 'hero_background_video';
      console.log('🎬 Updating hero background video content key');
    } else if (section) {
      // Handle other media types - be very specific about content keys
      const normalizedSection = section.toLowerCase().replace(/[-\s]/g, '_');
      
      if (file.type.startsWith('video/')) {
        // Non-hero videos
        if (normalizedSection === 'promotion' || normalizedSection === 'promotions') {
          contentKey = 'promotion_background_video';
        } else if (normalizedSection === 'about') {
          contentKey = 'about_background_video';
        } else {
          contentKey = `${normalizedSection}_background_video`;
        }
      } else if (file.type.startsWith('image/')) {
        // Images - be very specific
        if (normalizedSection === 'hero') {
          contentKey = 'hero_background_image';
          console.log('🖼️ Updating hero background image content key');
        } else if (normalizedSection === 'about') {
          contentKey = 'about_background_image';
          console.log('📖 Updating about background image content key');
        } else if (normalizedSection === 'promotion' || normalizedSection === 'promotions') {
          contentKey = 'promotion_background_image';
          console.log('🎯 Updating promotion background image content key');
        } else {
          contentKey = `${normalizedSection}_background_image`;
        }
      } else {
        contentKey = `${normalizedSection}_media`;
      }
    }

    // Only update content if we have a valid key
    if (contentKey) {
      console.log(`📝 Upserting content key: ${contentKey}`);
      await dbService.upsertSiteContent(contentKey, mediaUrl);

      // Broadcast the update for real-time updates
      broadcastContentUpdate({ [contentKey]: mediaUrl });
      console.log(`✅ Successfully updated ${contentKey}`);
    } else {
      console.log('⚠️ No content key determined, skipping content update');
    }

    return NextResponse.json(mediaAsset);
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}