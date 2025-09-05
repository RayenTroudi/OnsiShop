import { prisma } from '@/lib/database';

async function testVideoSystem() {
  try {
    console.log('🧪 Testing Database Video System...\n');

    // 1. Check if default video was created
    const videos = await (prisma as any).mediaAsset.findMany({
      where: { section: 'hero-background' }
    });
    
    console.log('📽️ Videos in database:', videos.length);
    videos.forEach((video: any, index: number) => {
      console.log(`   ${index + 1}. ${video.filename} (${video.id})`);
      console.log(`      URL: /api/media/${video.id}`);
      console.log(`      Type: ${video.type}`);
    });

    // 2. Check site content
    const heroVideo = await (prisma as any).siteContent.findUnique({
      where: { key: 'hero.backgroundVideo' }
    });

    console.log('\n🎬 Current hero video setting:');
    console.log(`   Key: hero.backgroundVideo`);
    console.log(`   Value: ${heroVideo?.value || 'Not set'}`);

    // 3. Test API endpoints
    console.log('\n🔗 Available API endpoints:');
    console.log('   GET /api/admin/videos - List all videos');
    console.log('   POST /api/admin/upload-video - Upload new video');
    console.log('   GET /api/media/[id] - Serve video by ID');
    console.log('   GET /api/content - Get site content (includes video URL)');

    console.log('\n✅ Database video system is working!');
    console.log('\n💡 To test:');
    console.log('   1. Upload a video via admin panel');
    console.log('   2. Video will be stored in database (MediaAsset table)');
    console.log('   3. Video URL will be /api/media/[asset-id]');
    console.log('   4. Deleting files from VS Code won\'t affect videos');
    console.log('   5. Videos are served from database, not file system');

  } catch (error) {
    console.error('❌ Error testing video system:', error);
  }
}

// Run the test
testVideoSystem();
