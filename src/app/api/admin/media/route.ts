import { broadcastContentUpdate } from '@/lib/content-stream';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch all media assets
export async function GET() {
  try {
    const mediaAssets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' }
    });

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

    // Validate file size based on type
    let maxSize: number;
    if (file.type.startsWith('video/')) {
      maxSize = 50 * 1024 * 1024; // 50MB for videos
    } else if (file.type.startsWith('image/')) {
      maxSize = 10 * 1024 * 1024; // 10MB for images
    } else {
      maxSize = 5 * 1024 * 1024; // 5MB for other files
    }

    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `File too large. Maximum size is ${sizeMB}MB for ${file.type.split('/')[0]} files.` },
        { status: 400 }
      );
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

    // Create media asset record
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        filename: file.name,
        url: mediaUrl,
        alt: alt || null,
        type: file.type,
        section: section || null
      }
    });

    // Revalidate relevant pages when media is uploaded
    revalidatePath('/');
    revalidatePath('/admin/content');

    // If this is a specific section media, also update the corresponding content key
    if (section) {
      let contentKey: string;
      if (file.type.startsWith('video/')) {
        contentKey = `${section}_background_video`;
      } else if (file.type.startsWith('image/')) {
        contentKey = `${section}_background_image`;
      } else {
        contentKey = `${section}_media`;
      }

      // Update or create the content key with the media URL
      await prisma.siteContent.upsert({
        where: { key: contentKey },
        update: { value: mediaUrl },
        create: { key: contentKey, value: mediaUrl }
      });

      // Broadcast the update
      broadcastContentUpdate({ [contentKey]: mediaUrl });
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