const fetch = require('node-fetch');

async function testAPIImages() {
  console.log('🧪 Testing API image transformation...');
  
  try {
    // Test the main products API
    console.log('\n1. Testing /api/products endpoint:');
    const response = await fetch('http://localhost:3000/api/products?limit=2');
    const data = await response.json();
    
    if (data.products && data.products.length > 0) {
      const product = data.products[0];
      console.log('✅ Product fetched:', product.title);
      console.log('🖼️ Images structure:', {
        imageCount: product.images?.length || 0,
        firstImage: product.images?.[0] ? {
          hasUrl: !!product.images[0].url,
          hasAltText: !!product.images[0].altText,
          urlType: product.images[0].url?.startsWith('data:') ? 'base64' : 'other',
          urlPreview: product.images[0].url?.substring(0, 50) + '...'
        } : 'No images'
      });
      console.log('🏷️ Featured image:', {
        hasUrl: !!product.featuredImage?.url,
        urlType: product.featuredImage?.url?.startsWith('data:') ? 'base64' : 'other',
        urlPreview: product.featuredImage?.url?.substring(0, 50) + '...'
      });
    } else {
      console.log('❌ No products found');
    }
    
    // Test the list API
    console.log('\n2. Testing /api/products/list endpoint:');
    const listResponse = await fetch('http://localhost:3000/api/products/list?limit=2');
    const listData = await listResponse.json();
    
    if (listData.products && listData.products.length > 0) {
      const product = listData.products[0];
      console.log('✅ List product fetched:', product.title);
      console.log('🖼️ Images structure:', {
        imageCount: product.images?.length || 0,
        firstImage: product.images?.[0] ? {
          hasUrl: !!product.images[0].url,
          hasAltText: !!product.images[0].altText,
          urlType: product.images[0].url?.startsWith('data:') ? 'base64' : 'other',
          urlPreview: product.images[0].url?.substring(0, 50) + '...'
        } : 'No images'
      });
    } else {
      console.log('❌ No products found in list');
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPIImages();
