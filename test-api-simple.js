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

async function testAPI() {
  console.log('🧪 Testing API endpoints...');
  
  try {
    console.log('\n1. Testing /api/products?limit=1');
    const data = await makeRequest('/api/products?limit=1');
    
    if (data.products && data.products.length > 0) {
      const product = data.products[0];
      console.log('✅ Product:', product.title);
      console.log('🖼️ Images array length:', product.images?.length || 0);
      
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0];
        console.log('📸 First image structure:');
        console.log('  - Type:', typeof firstImage);
        console.log('  - Has url property:', !!firstImage?.url);
        console.log('  - Has altText property:', !!firstImage?.altText);
        if (firstImage?.url) {
          console.log('  - URL type:', firstImage.url.startsWith('data:') ? 'base64' : 'external');
          console.log('  - URL length:', firstImage.url.length);
        }
      }
      
      console.log('🏷️ Featured image:');
      if (product.featuredImage) {
        console.log('  - Has url:', !!product.featuredImage.url);
        console.log('  - URL type:', product.featuredImage.url?.startsWith('data:') ? 'base64' : 'external');
      }
    }
    
    console.log('\n✅ API test completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();
