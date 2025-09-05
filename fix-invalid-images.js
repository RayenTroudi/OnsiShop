const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixInvalidImageData() {
  console.log('🔧 Fixing invalid image data...');
  
  try {
    const products = await prisma.product.findMany({
      where: {
        images: {
          not: null
        }
      }
    });
    
    for (const product of products) {
      try {
        const images = JSON.parse(product.images);
        if (!Array.isArray(images)) {
          console.log(`🔧 Fixing non-array images for product: ${product.title}`);
          await prisma.product.update({
            where: { id: product.id },
            data: {
              images: null
            }
          });
        }
      } catch (error) {
        console.log(`🔧 Fixing invalid JSON for product: ${product.title}`);
        await prisma.product.update({
          where: { id: product.id },
          data: {
            images: null
          }
        });
      }
    }
    
    console.log('✅ Fixed invalid image data');
    
  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixInvalidImageData();
