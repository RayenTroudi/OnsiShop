const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupFileBasedImages() {
  console.log('🧹 Starting cleanup of file-based image references...');
  
  try {
    // Get all products
    const products = await prisma.product.findMany();
    console.log(`📊 Found ${products.length} products to check`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      let needsUpdate = false;
      let images = [];
      
      // Parse existing images
      try {
        if (product.images) {
          const parsedImages = JSON.parse(product.images);
          if (Array.isArray(parsedImages)) {
            // Filter out file-based images, keep only data URLs and external URLs
            images = parsedImages.filter(img => {
              if (!img || typeof img !== 'string') return false;
              
              // Keep data URLs (base64)
              if (img.startsWith('data:')) return true;
              
              // Keep external URLs
              if (img.startsWith('http')) return true;
              
              // Remove file-based uploads
              if (img.startsWith('/uploads/')) {
                console.log(`🗑️ Removing file-based image: ${img} from product ${product.id}`);
                needsUpdate = true;
                return false;
              }
              
              return false;
            });
          }
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing images for product ${product.id}:`, error);
        images = [];
        needsUpdate = true;
      }
      
      // Update the product if needed
      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: images.length > 0 ? JSON.stringify(images) : null
          }
        });
        updatedCount++;
        console.log(`✅ Updated product ${product.id} (${product.title})`);
      }
    }
    
    console.log(`🎉 Cleanup completed! Updated ${updatedCount} products`);
    
    // Show summary of remaining images
    const remainingProducts = await prisma.product.findMany({
      where: {
        images: {
          not: null
        }
      }
    });
    
    let totalImages = 0;
    let dataUrlImages = 0;
    let externalImages = 0;
    
    for (const product of remainingProducts) {
      try {
        const images = JSON.parse(product.images);
        if (Array.isArray(images)) {
          totalImages += images.length;
          for (const img of images) {
            if (img.startsWith('data:')) dataUrlImages++;
            else if (img.startsWith('http')) externalImages++;
          }
        }
      } catch (error) {
        // Skip parsing errors
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`Total images remaining: ${totalImages}`);
    console.log(`Data URL images (base64): ${dataUrlImages}`);
    console.log(`External URL images: ${externalImages}`);
    
  } catch (error) {
    console.error('💥 Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupFileBasedImages();
