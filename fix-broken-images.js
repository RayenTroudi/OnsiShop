const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixBrokenProduct() {
  try {
    const productId = 'cmf2f4xhj000196cwon69gksg';
    
    console.log('🔧 Fixing broken product images...');
    
    // Get the current product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: true, title: true }
    });
    
    console.log('🔍 Current product:', product.title);
    console.log('📊 Current images type:', typeof product.images);
    console.log('📏 Current images length:', product.images?.length);
    
    // The images field contains a raw base64 string, let's convert it to proper JSON array
    const base64String = product.images;
    
    if (base64String && typeof base64String === 'string' && base64String.startsWith('data:image/')) {
      // It's a valid base64 data URL, let's wrap it in an array
      const properImageArray = [base64String];
      
      console.log('✅ Converting to proper JSON array...');
      
      // Update the product with properly formatted JSON
      await prisma.product.update({
        where: { id: productId },
        data: {
          images: JSON.stringify(properImageArray)
        }
      });
      
      console.log('✅ Fixed! Updated product with proper JSON array');
      
      // Verify the fix
      const updatedProduct = await prisma.product.findUnique({
        where: { id: productId },
        select: { images: true, title: true }
      });
      
      console.log('🔍 Updated images:', JSON.parse(updatedProduct.images));
    } else {
      console.log('⚠️ Images field is not a valid base64 string, clearing it...');
      
      // Clear the malformed images
      await prisma.product.update({
        where: { id: productId },
        data: {
          images: JSON.stringify([])
        }
      });
      
      console.log('✅ Cleared malformed images');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixBrokenProduct();
