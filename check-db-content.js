const { PrismaClient } = require('@prisma/client');

async function checkDatabaseContent() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== CHECKING DATABASE STATUS ===\n');
    
    // Check database file existence
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(__dirname, 'prisma', 'dev.db');
    const dbExists = fs.existsSync(dbPath);
    
    console.log(`📁 Database file: ${dbExists ? '✅ EXISTS' : '❌ MISSING'}`);
    if (dbExists) {
      const stats = fs.statSync(dbPath);
      console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`📅 Last modified: ${stats.mtime.toLocaleString()}`);
    }
    
    if (!dbExists) {
      console.log('\n🚨 DATABASE MISSING! Run: npm run db:setup');
      return;
    }

    // Check table contents
    console.log('\n=== TABLE CONTENTS ===\n');
    
    // Check SiteContent
    const siteContent = await prisma.siteContent.findMany();
    console.log(`📝 SiteContent: ${siteContent.length} items`);
    if (siteContent.length > 0) {
      siteContent.slice(0, 5).forEach(item => {
        console.log(`   - ${item.key}: ${item.value.substring(0, 50)}${item.value.length > 50 ? '...' : ''}`);
      });
      if (siteContent.length > 5) {
        console.log(`   ... and ${siteContent.length - 5} more`);
      }
    }
    
    // Check Products
    const productCount = await prisma.product.count();
    const products = await prisma.product.findMany({
      include: { category: true },
      take: 3
    });
    console.log(`\n🛍️ Products: ${productCount} total (showing first 3)`);
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
    const cartCount = await prisma.cart.count();
    const cartItemCount = await prisma.cartItem.count();
    console.log(`\n🛒 Shopping Carts: ${cartCount} carts, ${cartItemCount} items total`);
    
    console.log('\n=== DATABASE HEALTH ===');
    
    const isHealthy = 
      siteContent.length > 0 && 
      productCount > 0 && 
      categories.length > 0 && 
      users.length > 0;
    
    if (isHealthy) {
      console.log('✅ Database is healthy and contains data');
      console.log('🎯 Your app should work correctly when you restart it');
    } else {
      console.log('⚠️ Database is missing critical data');
      console.log('🔧 Run: npm run db:seed to restore data');
    }
    
    console.log('\n=== QUICK COMMANDS ===');
    console.log('• Reset & seed database: npm run db:reset');
    console.log('• Just seed data: npm run db:seed');
    console.log('• View in browser: npm run db:studio');
    console.log('• Setup from scratch: node setup-db.js');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    console.log('\n🔧 Try running: npm run db:setup');
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseContent();
