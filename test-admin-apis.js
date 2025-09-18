// Comprehensive admin API testing script
const BASE_URL = 'https://onsi-shop.vercel.app';

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    console.log(`\n🔍 Testing ${method} ${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success - Data type: ${Array.isArray(data) ? `Array(${data.length})` : typeof data}`);
      return { success: true, data, status: response.status };
    } else {
      const errorData = await response.text();
      console.log(`   ❌ Error: ${errorData}`);
      return { success: false, error: errorData, status: response.status };
    }
  } catch (error) {
    console.log(`   💥 Network Error: ${error.message}`);
    return { success: false, error: error.message, status: 0 };
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive admin API testing...\n');
  
  // Test basic content APIs
  console.log('📄 CONTENT MANAGEMENT TESTS');
  await testAPI('/api/content');
  await testAPI('/api/admin/content');
  
  // Test media APIs
  console.log('\n🖼️ MEDIA MANAGEMENT TESTS');
  await testAPI('/api/admin/media');
  
  // Test products APIs
  console.log('\n🛍️ PRODUCTS MANAGEMENT TESTS');
  await testAPI('/api/products');
  await testAPI('/api/admin/products');
  
  // Test categories APIs
  console.log('\n📂 CATEGORIES MANAGEMENT TESTS');
  await testAPI('/api/categories');
  await testAPI('/api/admin/categories');
  
  // Test translations APIs
  console.log('\n🌍 TRANSLATIONS TESTS');
  await testAPI('/api/translations?language=en');
  await testAPI('/api/translations?language=fr');
  await testAPI('/api/translations?language=ar');
  
  // Test specific content items
  console.log('\n🎯 SPECIFIC CONTENT TESTS');
  const contentResult = await testAPI('/api/content');
  if (contentResult.success && contentResult.data.data) {
    const content = contentResult.data.data;
    console.log('\n📋 Current content keys:');
    Object.keys(content).sort().forEach(key => {
      const value = content[key];
      const preview = value.length > 50 ? value.substring(0, 50) + '...' : value;
      console.log(`   ${key}: ${preview}`);
    });
    
    // Check for video content
    const videoKeys = Object.keys(content).filter(key => 
      key.includes('video') || key.includes('background')
    );
    console.log(`\n🎥 Video-related keys found: ${videoKeys.length}`);
    videoKeys.forEach(key => {
      console.log(`   ${key}: ${content[key]}`);
    });
  }
  
  // Test media assets
  console.log('\n🖼️ MEDIA ASSETS TEST');
  const mediaResult = await testAPI('/api/admin/media');
  if (mediaResult.success && Array.isArray(mediaResult.data)) {
    console.log(`   Found ${mediaResult.data.length} media assets`);
    mediaResult.data.forEach(asset => {
      console.log(`   - ${asset.filename} (${asset.type}) section: ${asset.section || 'none'}`);
    });
  }
  
  console.log('\n✅ Testing completed!');
}

runAllTests().catch(console.error);