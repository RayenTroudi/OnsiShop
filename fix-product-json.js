const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixProductJsonFields() {
  console.log('🔧 Fixing JSON fields in products to resolve parsing errors...');
  
  try {
    // Get all products
    const products = await prisma.product.findMany();
    
    console.log(`📦 Found ${products.length} products to fix`);
    
    for (const product of products) {
      console.log(`\n🔧 Fixing product: ${product.name}`);
      
      // Fix tags field - convert comma-separated string to JSON array
      let tagsJson = '[]';
      if (product.tags && typeof product.tags === 'string') {
        try {
          // If it's already JSON, keep it
          JSON.parse(product.tags);
          tagsJson = product.tags;
          console.log(`  ✅ Tags already in JSON format: ${product.tags}`);
        } catch {
          // Convert comma-separated string to JSON array
          const tagsArray = product.tags.split(',').map(tag => tag.trim());
          tagsJson = JSON.stringify(tagsArray);
          console.log(`  🔄 Converting tags: "${product.tags}" → ${tagsJson}`);
        }
      }
      
      // Fix images field - ensure it's proper JSON
      let imagesJson = '[]';
      if (product.images && typeof product.images === 'string') {
        try {
          // If it's already JSON, keep it
          JSON.parse(product.images);
          imagesJson = product.images;
          console.log(`  ✅ Images already in JSON format`);
        } catch {
          // If it's not JSON, create empty array
          imagesJson = '[]';
          console.log(`  🔄 Setting images to empty array`);
        }
      }
      
      // Fix variants field - ensure it's proper JSON
      let variantsJson = '[]';
      if (product.variants && typeof product.variants === 'string') {
        try {
          // If it's already JSON, keep it
          JSON.parse(product.variants);
          variantsJson = product.variants;
          console.log(`  ✅ Variants already in JSON format`);
        } catch {
          // If it's not JSON, create empty array
          variantsJson = '[]';
          console.log(`  🔄 Setting variants to empty array`);
        }
      }
      
      // Update the product with proper JSON fields
      await prisma.product.update({
        where: { id: product.id },
        data: {
          tags: tagsJson,
          images: imagesJson,
          variants: variantsJson
        }
      });
      
      console.log(`  ✅ Updated product: ${product.name}`);
    }
    
    console.log('\n🎉 All products fixed!');
    
    // Test by trying to parse one product
    console.log('\n🧪 Testing fix...');
    const testProduct = await prisma.product.findFirst();
    if (testProduct) {
      try {
        const tags = testProduct.tags ? JSON.parse(testProduct.tags) : [];
        const images = testProduct.images ? JSON.parse(testProduct.images) : [];
        const variants = testProduct.variants ? JSON.parse(testProduct.variants) : [];
        
        console.log(`✅ Test successful for product: ${testProduct.name}`);
        console.log(`  Tags: ${JSON.stringify(tags)}`);
        console.log(`  Images: ${JSON.stringify(images)}`);
        console.log(`  Variants: ${JSON.stringify(variants)}`);
      } catch (error) {
        console.log(`❌ Test failed: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductJsonFields();
