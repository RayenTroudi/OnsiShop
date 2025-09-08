const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseState() {
  console.log('🔍 Checking database state for categories and products...');
  
  try {
    // Check categories
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        handle: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    console.log('\n📂 Categories in Database:');
    if (categories.length === 0) {
      console.log('❌ No categories found in database!');
      console.log('🔧 This explains why header falls back to mock menu data');
    } else {
      categories.forEach(cat => {
        console.log(`  • ${cat.name} (handle: ${cat.handle}) - ${cat._count.products} products`);
      });
    }
    
    // Check total products
    const totalProducts = await prisma.product.count();
    console.log(`\n📦 Total Products: ${totalProducts}`);
    
    if (totalProducts === 0) {
      console.log('❌ No products found in database!');
      console.log('🔧 This explains why category pages show "No products found"');
    }
    
    // Check specific category handles that match mock menu
    const mockHandles = ['best-sellers', 'new-arrivals', 'clothing', 'accessories'];
    
    console.log('\n🔍 Checking Mock Menu Handles:');
    for (const handle of mockHandles) {
      const category = await prisma.category.findUnique({
        where: { handle: handle },
        include: {
          _count: {
            select: {
              products: true
            }
          }
        }
      });
      
      if (category) {
        console.log(`✅ ${handle}: Found category "${category.name}" with ${category._count.products} products`);
      } else {
        console.log(`❌ ${handle}: No category found with this handle`);
      }
    }
    
    console.log('\n💡 Diagnosis:');
    if (categories.length === 0) {
      console.log('• Header uses mock menu because no categories in database');
      console.log('• Navigation links point to /search/[handle] URLs');
      console.log('• Category pages will show "Category Not Found" if handles don\'t exist');
    }
    
    if (totalProducts === 0) {
      console.log('• Even if categories exist, no products will be displayed');
      console.log('• Category pages will show "No products found in this category yet"');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();
