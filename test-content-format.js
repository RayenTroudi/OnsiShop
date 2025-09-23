// Test to check the exact format of content API response
const fetch = require('node-fetch');

async function testContentAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/content');
    const data = await response.json();
    
    console.log('=== CONTENT API RESPONSE ===');
    console.log(JSON.stringify(data, null, 2));
    
    // Check specific fields
    if (data && data.length > 0) {
      const firstItem = data[0];
      console.log('\n=== FIRST ITEM ANALYSIS ===');
      console.log('Keys:', Object.keys(firstItem));
      console.log('Type:', firstItem.type);
      console.log('Key:', firstItem.key);
      console.log('Value keys:', Object.keys(firstItem.value || {}));
      
      // Look for video content
      const videoItem = data.find(item => item.type === 'video' || item.key?.includes('video'));
      if (videoItem) {
        console.log('\n=== VIDEO ITEM ===');
        console.log(JSON.stringify(videoItem, null, 2));
      }
      
      // Look for image content
      const imageItem = data.find(item => item.type === 'image' || item.key?.includes('image'));
      if (imageItem) {
        console.log('\n=== IMAGE ITEM ===');
        console.log(JSON.stringify(imageItem, null, 2));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testContentAPI();