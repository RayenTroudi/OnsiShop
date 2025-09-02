import { DatabaseService } from './src/lib/database';

async function listCategories() {
  try {
    const db = new DatabaseService();
    const categories = await db.getCategories();
    
    console.log('\n📋 Current Categories in Database:');
    console.log('=====================================');
    
    if (categories.length === 0) {
      console.log('❌ No categories found in database');
    } else {
      categories.forEach((cat, index) => {
        console.log(`${index + 1}. ${cat.name} (handle: ${cat.handle})`);
        if (cat.description) {
          console.log(`   📝 ${cat.description}`);
        }
        console.log('');
      });
    }
    
    console.log(`✅ Total categories: ${categories.length}`);
    
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
  }
}

listCategories();
