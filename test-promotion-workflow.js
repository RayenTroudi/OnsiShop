// Test the complete promotion workflow after simplification

async function testPromotionWorkflow() {
  try {
    console.log('🧪 Testing Complete Promotion Workflow...\n');
    
    // 1. Check current content API
    console.log('1. Checking content API...');
    const contentResponse = await fetch('https://onsi-shop.vercel.app/api/content?t=' + Date.now(), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (contentResponse.ok) {
      const result = await contentResponse.json();
      console.log('✅ Content API Status:', result.success);
      
      if (result.success && result.data) {
        const promotionImage = result.data['promotion_background_image'];
        if (promotionImage) {
          console.log('✅ promotion_background_image EXISTS');
          console.log('   Length:', promotionImage.length, 'characters');
          console.log('   Type:', promotionImage.startsWith('data:') ? 'Base64' : 'URL');
          console.log('   Preview:', promotionImage.substring(0, 100) + '...');
        } else {
          console.log('❌ promotion_background_image NOT FOUND');
        }
        
        // Check all promotion keys
        const promotionKeys = Object.keys(result.data).filter(k => k.includes('promotion'));
        console.log('📋 All promotion keys:', promotionKeys);
      }
    } else {
      console.log('❌ Content API Failed:', contentResponse.status);
    }
    
    // 2. Test the Promotions component logic
    console.log('\n2. Testing Promotions component logic...');
    console.log('Expected key: promotion_background_image');
    console.log('Fallback: /images/placeholder-product.svg');
    
    // 3. Check if the issue is in the frontend fetch
    console.log('\n3. Testing fetch with same parameters as Promotions component...');
    const timestamp = new Date().getTime();
    const testResponse = await fetch(`https://onsi-shop.vercel.app/api/content?t=${timestamp}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (testResponse.ok) {
      const testResult = await testResponse.json();
      console.log('✅ Frontend-style fetch successful');
      
      if (testResult.success && testResult.data) {
        const backgroundImage = testResult.data['promotion_background_image'] || '/images/placeholder-product.svg';
        console.log('Resolved background image:', backgroundImage.startsWith('data:') ? 'Base64 Image' : backgroundImage);
      }
    }
    
    // 4. Test media assets API
    console.log('\n4. Checking media assets API...');
    const mediaResponse = await fetch('https://onsi-shop.vercel.app/api/admin/media');
    if (mediaResponse.ok) {
      const media = await mediaResponse.json();
      const promotionAssets = media.filter(asset => asset.section === 'promotions');
      console.log('✅ Promotion media assets:', promotionAssets.length);
      promotionAssets.forEach(asset => {
        console.log(`   - ${asset.filename} (${asset.type})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testPromotionWorkflow();