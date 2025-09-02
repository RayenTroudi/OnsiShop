import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkVariantData() {
  try {
    const product = await prisma.product.findUnique({
      where: { handle: 'watch-minimal-silver' }
    });
    
    if (product && product.variants) {
      console.log('Watch Product Variants:');
      console.log(JSON.stringify(JSON.parse(product.variants), null, 2));
    }
    
    // Also check if the product has images
    if (product && product.images) {
      console.log('\nWatch Product Images:');
      console.log(JSON.stringify(JSON.parse(product.images), null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVariantData();
