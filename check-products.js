const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
  try {
    const products = await prisma.product.findMany({
      select: { id: true, title: true, images: true }
    });
    console.log('📦 Available products:');
    products.forEach((p, i) => {
      console.log(`${i+1}. ID: ${p.id}`);
      console.log(`   Title: ${p.title}`);
      try {
        const imageList = p.images ? JSON.parse(p.images) : [];
        const imagePreview = Array.isArray(imageList) ? 
          imageList.map(img => img?.substring(0, 50) + '...') : 'Invalid format';
        console.log(`   Images: ${JSON.stringify(imagePreview)}`);
      } catch (e) {
        console.log(`   Images: Parse error - ${p.images}`);
      }
      console.log('');
    });
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProducts();
