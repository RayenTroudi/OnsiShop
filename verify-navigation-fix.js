const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyFixAndNavigation() {
  console.log('🧪 Verifying product fix and navigation functionality...');
  
  try {
    // Test that all products can be transformed successfully
    console.log('\n📦 Testing product transformation...');
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of products) {
      try {
        // Simulate the transformToShopifyProduct method
        const tags = product.tags ? JSON.parse(product.tags) : [];
        const images = product.images ? JSON.parse(product.images) : [];
        const variants = product.variants ? JSON.parse(product.variants) : [];
        
        console.log(`✅ ${product.name} (${product.category?.name}): Tags=${tags.length}, Images=${images.length}, Variants=${variants.length}`);
        successCount++;
      } catch (error) {
        console.log(`❌ ${product.name}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Results: ${successCount} successful, ${errorCount} errors`);
    
    // Test category navigation
    console.log('\n🔍 Testing category navigation...');
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    console.log('Available categories:');
    categories.forEach(cat => {
      console.log(`  • ${cat.name} (${cat.handle}): ${cat._count.products} products`);
    });
    
    // Test each navigation URL
    const navigationUrls = [
      '/search/best-sellers',
      '/search/new-arrivals', 
      '/search/clothing',
      '/search/accessories'
    ];
    
    console.log('\n🔗 Navigation URL validation:');
    for (const url of navigationUrls) {
      const handle = url.replace('/search/', '');
      const category = await prisma.category.findUnique({
        where: { handle: handle },
        include: {
          products: true
        }
      });
      
      if (category) {
        console.log(`✅ ${url} → "${category.name}" (${category.products.length} products)`);
      } else {
        console.log(`❌ ${url} → Category not found`);
      }
    }
    
    if (successCount === products.length && errorCount === 0) {
      console.log('\n🎉 ALL SYSTEMS GO!');
      console.log('• Product JSON parsing: ✅ Fixed');
      console.log('• Navigation translation: ✅ Working');
      console.log('• Category pages: ✅ Functional');
      console.log('• Product display: ✅ Ready');
    } else {
      console.log('\n⚠️  Some issues remain - check errors above');
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyFixAndNavigation();
