import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndSeedVideo() {
  try {
    console.log('🎬 Checking current video content in database...');

    // Check all current site content
    const allContent = await prisma.siteContent.findMany();
    console.log('📋 Current site content entries:');
    allContent.forEach(item => {
      console.log(`  - ${item.key}: ${item.value}`);
    });

    // Check if hero.backgroundVideo exists
    const existingVideo = await prisma.siteContent.findUnique({
      where: { key: 'hero.backgroundVideo' }
    });

    if (existingVideo) {
      console.log(`✅ Background video already exists: ${existingVideo.value}`);
      
      // Check if it's the default video we want
      if (existingVideo.value === '/videos/clothing-shoot.mp4') {
        console.log('✅ Video is already set to the correct default value');
      } else {
        console.log(`📝 Current video: ${existingVideo.value}`);
        console.log('ℹ️  You can change this through the admin interface');
      }
    } else {
      console.log('❌ No background video found in database');
      console.log('🔧 Adding default background video...');
      
      // Add the default background video
      await prisma.siteContent.create({
        data: {
          key: 'hero.backgroundVideo',
          value: '/videos/clothing-shoot.mp4'
        }
      });
      
      console.log('✅ Default background video added to database');
    }

    // Verify the video file exists
    const fs = require('fs');
    const path = require('path');
    const videoPath = path.join(process.cwd(), 'public', 'videos', 'clothing-shoot.mp4');
    
    if (fs.existsSync(videoPath)) {
      console.log('✅ Video file exists at: public/videos/clothing-shoot.mp4');
    } else {
      console.log('⚠️  Video file not found at: public/videos/clothing-shoot.mp4');
      console.log('📁 Please ensure the video file is in the public/videos directory');
    }

    console.log('\n🎯 Next steps:');
    console.log('1. Visit http://localhost:3001 to see the video background');
    console.log('2. Go to http://localhost:3001/admin/content to manage videos');
    console.log('3. Click "Video Management" tab to upload new videos');

  } catch (error) {
    console.error('❌ Error checking/seeding video:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeedVideo();
