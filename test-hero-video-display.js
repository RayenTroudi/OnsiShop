// Test if hero video is being served correctly
async function testHeroVideo() {
  console.log('🎬 Testing Hero Video Display...');
  
  try {
    // First, test the content API to see what hero video URL we get
    const contentResponse = await fetch('/api/content');
    if (contentResponse.ok) {
      const contentData = await contentResponse.json();
      
      console.log('✅ Content API Response received');
      
      const heroVideoKey = contentData.data?.hero_background_video || contentData.hero_background_video;
      console.log('Hero video key value:', heroVideoKey ? `${heroVideoKey.length} characters` : 'null');
      
      if (heroVideoKey) {
        // If it's a data URL, test if it's valid
        if (heroVideoKey.startsWith('data:video/')) {
          console.log('📹 Found base64 video data URL');
          console.log('Data URL prefix:', heroVideoKey.substring(0, 50) + '...');
          
          // Test if we can create a video element with it
          if (typeof document !== 'undefined') {
            const video = document.createElement('video');
            video.src = heroVideoKey;
            
            video.onloadeddata = () => {
              console.log('✅ Base64 video is valid and can be loaded');
              console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
              console.log('Video duration:', video.duration, 'seconds');
            };
            
            video.onerror = (e) => {
              console.error('❌ Base64 video is invalid:', e);
            };
          }
        } else {
          console.log('🔗 Hero video URL:', heroVideoKey);
        }
      } else {
        console.log('❌ No hero video found in content');
      }
      
      // Also check for other media keys
      const mediaKeys = ['hero_background_image', 'promotion_background_image'];
      mediaKeys.forEach(key => {
        const value = contentData.data?.[key] || contentData[key];
        if (value) {
          console.log(`📷 ${key}:`, value.length, 'characters');
          if (value.startsWith('data:')) {
            console.log(`   → Base64 ${value.substring(0, 20)}...`);
          } else {
            console.log(`   → URL: ${value}`);
          }
        }
      });
      
    } else {
      console.error('❌ Failed to fetch content:', contentResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testHeroVideo();