const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBrokenProduct() {
  try {
    const product = await prisma.product.findUnique({
      where: { id: 'cmf2f4xhj000196cwon69gksg' },
      select: { images: true, title: true }
    });
    
    console.log('🔍 Product:', product.title);
    console.log('Raw images data:', product.images);
    console.log('Type:', typeof product.images);
    console.log('Length:', product.images?.length);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkBrokenProduct();
