import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentData() {
  try {
    console.log('=== DATABASE CONTENT SUMMARY ===\n');
    
    // Users
    const users = await prisma.user.findMany();
    console.log(`👥 USERS: ${users.length}`);
    users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
    
    // Categories  
    const categories = await prisma.category.findMany();
    console.log(`\n🏷️  CATEGORIES: ${categories.length}`);
    categories.forEach(c => console.log(`   - ${c.name} (${c.handle})`));
    
    // Products
    const products = await prisma.product.findMany({ include: { category: true } });
    console.log(`\n📦 PRODUCTS: ${products.length}`);
    products.forEach(p => {
      const categoryName = p.category ? p.category.name : 'No Category';
      const variants = p.variants ? JSON.parse(p.variants).length : 0;
      console.log(`   - ${p.title} ($${p.price}) [${categoryName}] - ${variants} variants`);
    });
    
    // Site Content
    const content = await prisma.siteContent.findMany();
    console.log(`\n📄 SITE CONTENT: ${content.length}`);
    content.forEach(c => console.log(`   - ${c.key}`));
    
    // Navigation
    const navigation = await prisma.navigationItem.findMany();
    console.log(`\n🧭 NAVIGATION: ${navigation.length}`);
    navigation.forEach(n => console.log(`   - ${n.title} -> ${n.url} ${n.parentId ? '(sub-item)' : ''}`));
    
    // Social Media
    const social = await prisma.socialMedia.findMany();
    console.log(`\n📱 SOCIAL MEDIA: ${social.length}`);
    social.forEach(s => console.log(`   - ${s.platform}: ${s.title}`));
    
    // Media Assets
    const media = await prisma.mediaAsset.findMany();
    console.log(`\n🎬 MEDIA ASSETS: ${media.length}`);
    if (media.length === 0) {
      console.log('   (none found)');
    } else {
      media.forEach(m => console.log(`   - ${m.filename} (${m.type}) - ${m.section || 'general'}`));
    }
    
    // Reservations
    const reservations = await prisma.reservation.findMany();
    console.log(`\n📝 RESERVATIONS: ${reservations.length}`);
    if (reservations.length === 0) {
      console.log('   (none found)');
    } else {
      reservations.forEach(r => console.log(`   - ${r.fullName} (${r.status}) - $${r.totalAmount}`));
    }
    
    console.log('\n✅ Database content check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentData();
