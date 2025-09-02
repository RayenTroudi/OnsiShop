import { DatabaseService } from './src/lib/database';

async function addSampleCategories() {
  const db = new DatabaseService();
  
  const categories = [
    {
      name: 'Best Sellers',
      handle: 'best-sellers',
      description: 'Our most popular and bestselling items across all categories.'
    },
    {
      name: 'Dresses',
      handle: 'dresses',
      description: 'Elegant dresses for every occasion and season.'
    },
    {
      name: 'Jeans',
      handle: 'jeans',
      description: 'Premium denim jeans in various fits and styles.'
    },
    {
      name: 'T-Shirts',
      handle: 't-shirts',
      description: 'Comfortable and stylish t-shirts for everyday wear.'
    },
    {
      name: 'Shoes',
      handle: 'shoes',
      description: 'Footwear collection including sneakers, boots, and formal shoes.'
    },
    {
      name: 'Bags',
      handle: 'bags',
      description: 'Handbags, backpacks, and accessories for every style.'
    },
    {
      name: 'New Arrivals',
      handle: 'new-arrivals',
      description: 'Latest additions to our collection.'
    }
  ];

  try {
    console.log('Adding sample categories...');
    
    for (const category of categories) {
      try {
        const created = await db.createCategory(category);
        console.log(`✅ Created category: ${created.name}`);
      } catch (error) {
        console.log(`ℹ️ Category "${category.name}" already exists`);
      }
    }
    
    console.log('All categories processed successfully!');
    
    // Display all categories
    const allCategories = await db.getCategories();
    console.log('\nAll categories in database:');
    allCategories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.handle})`);
    });
    
  } catch (error) {
    console.error('Error adding categories:', error);
  }
}

addSampleCategories();
