// Quick test to check product API response format

async function quickTest() {
  console.log('🧪 Testing product API response...');
  
  try {
    const response = await fetch('http://localhost:3000/api/products?limit=1');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📦 API Response structure:');
    console.log('- Products count:', data.products?.length || 0);
    
    if (data.products && data.products.length > 0) {
      const product = data.products[0];
      console.log('\n🔍 First product analysis:');
      console.log('- Title:', product.title);
      console.log('- Has images array:', !!product.images);
      console.log('- Images count:', product.images?.length || 0);
      
      if (product.images && product.images.length > 0) {
        const firstImage = product.images[0];
        console.log('- First image type:', typeof firstImage);
        console.log('- First image is object:', firstImage && typeof firstImage === 'object');
        console.log('- Has url property:', !!firstImage?.url);
        console.log('- Has altText property:', !!firstImage?.altText);
        
        if (firstImage?.url) {
          console.log('- URL type:', firstImage.url.startsWith('data:') ? 'base64' : 'external');
          console.log('- URL preview:', firstImage.url.substring(0, 50) + '...');
        }
      }
      
      console.log('\n🖼️ Featured image:');
      console.log('- Has featuredImage:', !!product.featuredImage);
      if (product.featuredImage) {
        console.log('- Featured URL type:', product.featuredImage.url?.startsWith('data:') ? 'base64' : 'external');
        console.log('- Featured URL preview:', product.featuredImage.url?.substring(0, 50) + '...');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Check if we're in a browser environment
if (typeof window !== 'undefined') {
  quickTest();
} else {
  console.log('❌ This script needs to run in a browser environment');
}
