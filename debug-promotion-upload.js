// Debug promotion image upload workflow

const fs = require('fs');
const { createReadStream } = require('fs');

async function testPromotionUpload() {
  try {
    console.log('🔍 Testing promotion image upload workflow...\n');
    
    // 1. Check current content state
    console.log('1. Checking current promotion content...');
    const contentResponse = await fetch('https://onsi-shop.vercel.app/api/content?t=' + Date.now());
    const contentResult = await contentResponse.json();
    
    if (contentResult.success && contentResult.data) {
      console.log('Current promotion_background_image:', contentResult.data['promotion_background_image'] || 'NOT SET');
      const promotionKeys = Object.keys(contentResult.data).filter(k => k.includes('promotion'));
      console.log('All promotion keys:', promotionKeys);
    }
    
    // 2. Check media assets
    console.log('\n2. Checking media assets...');
    const mediaResponse = await fetch('https://onsi-shop.vercel.app/api/admin/media');
    if (mediaResponse.ok) {
      const media = await mediaResponse.json();
      const promotionAssets = media.filter(asset => 
        asset.section === 'promotions' || asset.section === 'promotion'
      );
      console.log('Promotion media assets found:', promotionAssets.length);
      promotionAssets.forEach(asset => {
        console.log('  -', asset.filename, 'Section:', asset.section, 'URL type:', asset.url.startsWith('data:') ? 'Base64' : 'URL');
      });
    }
    
    // 3. Check what happens when uploading to different section names
    console.log('\n3. Testing section name handling...');
    console.log('When section="promotions" -> content key should be "promotion_background_image"');
    console.log('When section="promotion" -> content key should be "promotion_background_image"');
    
    // 4. Check the Promotions component expectations
    console.log('\n4. Promotions component expects:');
    console.log('Content key: promotion_background_image');
    console.log('Source: Promotions.tsx line ~40');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

testPromotionUpload();