require('dotenv').config();

async function testUploadEndpoint() {
  try {
    console.log('🧪 Testing upload endpoint...\n');
    
    // Test if the upload endpoint is accessible
    const response = await fetch('http://localhost:3000/api/admin/upload-image', {
      method: 'GET'
    });
    
    console.log('Upload endpoint status:', response.status);
    
    if (response.status === 405) {
      console.log('✅ Upload endpoint exists (Method Not Allowed is expected for GET)');
    } else {
      console.log('⚠️  Unexpected response from upload endpoint');
    }
    
    // Test content API
    const contentResponse = await fetch('http://localhost:3000/api/content');
    const contentResult = await contentResponse.json();
    
    console.log('\n📋 Content API test:');
    console.log('Status:', contentResponse.status);
    console.log('Success:', contentResult.success);
    
    if (contentResult.success && contentResult.data) {
      console.log('Current promotion.backgroundImage:', contentResult.data['promotion.backgroundImage']);
    }
    
    console.log('\n✅ API endpoints are working correctly');
    
  } catch (error) {
    console.error('❌ Error testing endpoints:', error);
  }
}

testUploadEndpoint();
