const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Invalid JSON response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testProductAPI() {
  console.log('🧪 Testing individual product API...');
  
  try {
    const productId = 'cmf2em09n000g96ywpqppmn8x';
    console.log(`\n1. Testing /api/products/${productId}`);
    const data = await makeRequest(`/api/products/${productId}`);
    
    console.log('✅ Product fetched:', data.title || data.name);
    console.log('🖼️ Image structure:');
    console.log('  - Direct image:', data.image);
    console.log('  - Has images array:', !!data.images);
    console.log('  - Images type:', typeof data.images);
    if (data.images && Array.isArray(data.images)) {
      console.log('  - Images length:', data.images.length);
      console.log('  - First image:', data.images[0]);
    }
    
    console.log('\n🏷️ Price structure:');
    console.log('  - Direct price:', data.price);
    console.log('  - Has priceRange:', !!data.priceRange);
    if (data.priceRange) {
      console.log('  - minVariantPrice amount:', data.priceRange.minVariantPrice?.amount);
    }
    
    console.log('\n📦 Full product keys:', Object.keys(data));
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testProductAPI();
