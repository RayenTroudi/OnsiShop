import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addBackgroundVideo() {
  try {
    console.log('🎬 Adding background video to site content...');

    // Check if hero.backgroundVideo already exists
    const existingVideo = await prisma.siteContent.findUnique({
      where: { key: 'hero.backgroundVideo' }
    });

    if (existingVideo) {
      console.log('✅ Background video content already exists');
      return;
    }

    // Add the background video content
    await prisma.siteContent.create({
      data: {
        key: 'hero.backgroundVideo',
        value: '/videos/clothing-shoot.mp4'
      }
    });

    console.log('✅ Background video content added successfully');

  } catch (error) {
    console.error('❌ Error adding background video:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addBackgroundVideo();
