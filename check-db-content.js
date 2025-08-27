const { PrismaClient } = require('@prisma/client');

async function checkDatabaseContent() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== CHECKING LOCAL DATABASE CONTENT ===\n');
    
    // Check SiteContent
    const siteContent = await prisma.siteContent.findMany();
    console.log(`📝 SiteContent: ${siteContent.length} items`);
    if (siteContent.length > 0) {
      siteContent.forEach(item => {
        console.log(`   - ${item.key}: ${item.value.substring(0, 80)}${item.value.length > 80 ? '...' : ''}`);
      });
    }
    
    // Check Products
    const products = await prisma.product.findMany({
      include: { category: true },
      take: 5
    });
    console.log(`\n🛍️ Products: ${products.length} items (showing first 5)`);
    products.forEach(product => {
      console.log(`   - ${product.title} (${product.category?.name || 'No category'}) - $${product.price}`);
    });
    
    // Check Categories
    const categories = await prisma.category.findMany();
    console.log(`\n📂 Categories: ${categories.length} items`);
    categories.forEach(category => {
      console.log(`   - ${category.name} (${category.handle})`);
    });
    
    // Check Users
    const users = await prisma.user.findMany();
    console.log(`\n👥 Users: ${users.length} items`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Check Carts
    const carts = await prisma.cart.findMany({
      include: { items: true }
    });
    console.log(`\n🛒 Carts: ${carts.length} items`);
    carts.forEach(cart => {
      console.log(`   - Cart ${cart.id}: ${cart.items.length} items`);
    });
    
    console.log('\n=== SUMMARY ===');
    console.log('This is your current LOCAL database content.');
    console.log('If this differs from what you expect, your modifications may have been lost during the git pull.');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseContent();
