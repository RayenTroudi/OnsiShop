// Using built-in fetch (Node.js 18+)

const BASE_URL = 'https://onsi-shop.vercel.app';

async function testVideoContentDebug() {
  console.log('🔍 Debugging Hero Video Content Issues');
  console.log('=====================================\n');

  // 1. Test content API to see current hero_background_video value
  console.log('1. Testing /api/content endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/content`);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Content API working');
      const heroVideo = result.data.hero_background_video;
      console.log('🎬 Current hero_background_video value:', heroVideo);
      
      if (!heroVideo || heroVideo === '') {
        console.log('⚠️  Hero video content is empty - this explains why video not showing');
      } else {
        console.log('✅ Hero video content exists');
        console.log('📄 Video URL starts with:', heroVideo.substring(0, 50) + '...');
      }
    } else {
      console.log('❌ Content API failed:', result);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // 2. Test content-manager API
  console.log('\n2. Testing /api/content-manager endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/content-manager`);
    const result = await response.json();
    
    if (result.success && result.items) {
      console.log('✅ Content Manager API working');
      console.log('📊 Total items:', result.items.length);
      
      const heroVideoItem = result.items.find(item => item.key === 'hero_background_video');
      if (heroVideoItem) {
        console.log('🎬 Hero video item found:', {
          key: heroVideoItem.key,
          value: heroVideoItem.value.substring(0, 50) + '...',
          updated: heroVideoItem.updatedAt
        });
      } else {
        console.log('⚠️  No hero_background_video item found in content-manager');
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // 3. Test media API for hero videos
  console.log('\n3. Testing /api/admin/media for hero videos...');
  try {
    const response = await fetch(`${BASE_URL}/api/admin/media`);
    const media = await response.json();
    
    console.log('✅ Media API working');
    console.log('📊 Total media assets:', media.length);
    
    const heroVideos = media.filter(asset => 
      asset.section === 'hero' && asset.type.startsWith('video/')
    );
    
    console.log('🎬 Hero videos found:', heroVideos.length);
    
    if (heroVideos.length > 0) {
      heroVideos.forEach((video, index) => {
        console.log(`📹 Video ${index + 1}:`, {
          id: video.id,
          filename: video.filename,
          type: video.type,
          section: video.section,
          created: video.createdAt,
          urlStart: video.url.substring(0, 50) + '...'
        });
      });
    } else {
      console.log('⚠️  No hero videos found in media assets');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n🎯 Diagnosis Summary:');
  console.log('====================');
  console.log('If you see:');
  console.log('• "Hero video content is empty" → Upload a video through admin');
  console.log('• "No hero videos found" → Video upload may have failed');
  console.log('• "25 elements changed" → Content system initializing defaults');
  console.log('');
  console.log('💡 Common Solutions:');
  console.log('1. Check if video upload succeeded in /api/admin/media');
  console.log('2. Verify hero_background_video content key is updated');
  console.log('3. Clear browser cache and refresh homepage');
  console.log('4. Check video file size (must be under 5MB)');
}

// Run the debug test
testVideoContentDebug().catch(console.error);