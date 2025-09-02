import { prisma } from './src/lib/database';

async function updateProductsSchema() {
  try {
    console.log('🚀 Updating products with name and stock fields...');

    const products = await prisma.product.findMany();
    
    for (const product of products) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          name: product.title, // Use title as name
          stock: Math.floor(Math.random() * 50) + 10, // Random stock between 10-60
          image: product.images ? JSON.parse(product.images)[0] : null // Use first image as main image
        }
      });
      console.log(`✅ Updated product: ${product.title}`);
    }

    console.log('🎉 All products updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProductsSchema();
