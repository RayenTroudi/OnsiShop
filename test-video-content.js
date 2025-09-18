// Test script to check video content
async function checkVideoContent() {
  try {
    console.log('Fetching content from API...');
    const response = await fetch('https://onsi-shop.vercel.app/api/content');
    const result = await response.json();
    
    if (result.success) {
      console.log('\n=== Video-related content keys ===');
      const videoKeys = Object.keys(result.data).filter(key => 
        key.includes('video') || key.includes('background')
      );
      
      videoKeys.forEach(key => {
        console.log(`${key}: ${result.data[key]}`);
      });
      
      console.log('\n=== All content keys ===');
      Object.keys(result.data).sort().forEach(key => {
        console.log(`${key}: ${result.data[key].substring(0, 100)}${result.data[key].length > 100 ? '...' : ''}`);
      });
      
      // Check specifically for hero_background_video
      if (result.data.hero_background_video) {
        console.log('\n=== Hero Background Video Found ===');
        console.log('URL:', result.data.hero_background_video);
        console.log('Is data URL?', result.data.hero_background_video.startsWith('data:'));
      } else {
        console.log('\n=== No hero_background_video found ===');
      }
    } else {
      console.error('API returned error:', result);
    }
    
    // Also check media assets
    console.log('\n=== Fetching media assets ===');
    const mediaResponse = await fetch('https://onsi-shop.vercel.app/api/admin/media');
    const mediaResult = await mediaResponse.json();
    
    console.log('Media assets count:', mediaResult.length);
    const videos = mediaResult.filter(asset => asset.type.startsWith('video/'));
    console.log('Video assets:', videos.length);
    
    videos.forEach(video => {
      console.log(`- ${video.filename} (section: ${video.section || 'none'})`);
      console.log(`  Type: ${video.type}`);
      console.log(`  URL: ${video.url.substring(0, 50)}...`);
      console.log(`  Created: ${video.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkVideoContent();