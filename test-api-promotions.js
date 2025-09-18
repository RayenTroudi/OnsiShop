console.log('🎯 Testing Promotions API Response...');

const testPromotionsAPI = async () => {
  try {
    console.log('📡 Fetching from /api/content...');
    
    const response = await fetch('http://localhost:3000/api/content', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ API Response received');
    console.log('Success:', result.success);
    
    if (result.success && result.data) {
      console.log('\n📋 Promotion Content:');
      console.log('Background Image:', 
        result.data.promotion_background_image ? 
          (result.data.promotion_background_image.startsWith('data:') ? 
            `✅ Base64 image (${(result.data.promotion_background_image.length / 1024).toFixed(0)}KB)` : 
            result.data.promotion_background_image) : 
          '❌ None');
      console.log('Title:', result.data.promotion_title || '❌ None');
      console.log('Subtitle:', result.data.promotion_subtitle || '❌ None');
      console.log('Button Text:', result.data.promotion_button_text || '❌ None');
      console.log('Button Link:', result.data.promotion_button_link || '❌ None');
    } else {
      console.log('❌ API returned no data or failed');
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
};

// Run the test
testPromotionsAPI().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});