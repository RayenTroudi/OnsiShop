const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestCategories() {
  try {
    console.log('🔧 Adding test categories...');
    
    // Check if categories already exist
    const existingCategories = await prisma.category.findMany();
    console.log('📋 Existing categories:', existingCategories);
    
    if (existingCategories.length === 0) {
      // Add some test categories
      const categories = [
        { name: 'Men\'s Clothing', handle: 'mens-clothing' },
        { name: 'Women\'s Clothing', handle: 'womens-clothing' },
        { name: 'Accessories', handle: 'accessories' },
        { name: 'Shoes', handle: 'shoes' },
        { name: 'New Arrivals', handle: 'new-arrivals' }
      ];
      
      for (const category of categories) {
        await prisma.category.create({
          data: category
        });
        console.log(`✅ Created category: ${category.name}`);
      }
    } else {
      console.log('ℹ️ Categories already exist, skipping creation');
    }
    
    const allCategories = await prisma.category.findMany();
    console.log('📋 All categories:', allCategories);
    
  } catch (error) {
    console.error('❌ Error adding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestCategories();
