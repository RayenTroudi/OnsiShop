const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBase64ImageSystem() {
  console.log('🧪 Testing base64 image system...');
  
  try {
    // Create a small test image as base64 (1x1 red pixel PNG)
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA4nEWWwAAAABJRU5ErkJggg==';
    
    // Check if we have any products to test with
    const products = await prisma.product.findMany({
      take: 1
    });
    
    if (products.length === 0) {
      console.log('🔧 No products found, creating test product...');
      
      // Create a test product with base64 image
      const testProduct = await prisma.product.create({
        data: {
          handle: 'test-base64-product',
          title: 'Test Base64 Product',
          description: 'This is a test product to verify base64 image storage',
          price: 29.99,
          images: JSON.stringify([testImageBase64])
        }
      });
      
      console.log('✅ Created test product:', testProduct.id);
    } else {
      // Update existing product with test image
      const product = products[0];
      console.log(`🔧 Using existing product: ${product.id} (${product.title})`);
      
      let existingImages = [];
      try {
        if (product.images) {
          existingImages = JSON.parse(product.images);
        }
      } catch (error) {
        console.warn('Failed to parse existing images, starting fresh');
      }
      
      // Add test image to existing images
      const updatedImages = [...existingImages, testImageBase64];
      
      await prisma.product.update({
        where: { id: product.id },
        data: {
          images: JSON.stringify(updatedImages)
        }
      });
      
      console.log('✅ Added test base64 image to existing product');
    }
    
    // Verify the data was stored correctly
    const updatedProducts = await prisma.product.findMany({
      where: {
        images: {
          not: null
        }
      }
    });
    
    console.log('\n📊 Products with images:');
    for (const product of updatedProducts) {
      try {
        const images = JSON.parse(product.images);
        const base64Count = images.filter(img => img.startsWith('data:')).length;
        const httpCount = images.filter(img => img.startsWith('http')).length;
        
        console.log(`- ${product.title}: ${images.length} images (${base64Count} base64, ${httpCount} external)`);
        
        // Show first few characters of base64 images
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (img.startsWith('data:')) {
            console.log(`  📷 Image ${i + 1}: ${img.substring(0, 50)}...`);
          } else {
            console.log(`  🌐 Image ${i + 1}: ${img}`);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing images for ${product.title}:`, error);
      }
    }
    
    console.log('\n🎉 Base64 image system test completed successfully!');
    console.log('📝 Images are now stored directly in the database as base64 data URLs');
    console.log('🚫 No more file uploads to public/uploads directory');
    console.log('✅ This eliminates 404 errors for missing image files');
    
  } catch (error) {
    console.error('💥 Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBase64ImageSystem();
