// Test the admin media API endpoint directly
async function testAdminMediaAPI() {
  console.log('🔍 Testing /api/admin/media endpoint...');
  
  try {
    const response = await fetch('/api/admin/media');
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response Success!');
      console.log('Media assets count:', data.length);
      
      data.forEach((asset, index) => {
        console.log(`\n${index + 1}. ${asset.filename}`);
        console.log(`   Section: ${asset.section}`);
        console.log(`   Type: ${asset.type}`);
        console.log(`   URL Length: ${asset.url ? asset.url.length : 'null'} chars`);
        console.log(`   Created: ${asset.createdAt}`);
      });
    } else {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('❌ Fetch Error:', error);
  }
}

// Also test the content API
async function testContentAPI() {
  console.log('\n🔍 Testing /api/content endpoint...');
  
  try {
    const response = await fetch('/api/content');
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Content API Success!');
      console.log('Content keys found:', Object.keys(data).length);
      
      // Look for media-related keys
      const mediaKeys = Object.keys(data).filter(key => 
        key.includes('hero') || key.includes('promotion') || key.includes('image') || key.includes('video')
      );
      
      console.log('\nMedia-related content keys:');
      mediaKeys.forEach(key => {
        const value = data[key];
        console.log(`- ${key}: ${value ? value.length + ' chars' : 'null'}`);
      });
    } else {
      console.error('❌ Content API Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Content API Fetch Error:', error);
  }
}

// Run tests
testAdminMediaAPI();
testContentAPI();