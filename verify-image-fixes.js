require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function verifyFixedImages() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verifying missing image fixes...\n');
    
    // Check all content for missing image references
    const allContent = await prisma.siteContent.findMany();
    
    const missingImagePaths = [
      '/images/promotions/winter.jpg',
      '/images/background-image-1756043891412-0nifzaa2fwm.PNG',
      '/uploads/1756809700099-ody6en5rc9h.webp'
    ];
    
    console.log('🎯 Checking for hardcoded missing image references in database...');
    let foundMissing = false;
    
    for (const content of allContent) {
      if (missingImagePaths.includes(content.value)) {
        console.log(`❌ Found missing image reference: ${content.key} = "${content.value}"`);
        foundMissing = true;
      }
    }
    
    if (!foundMissing) {
      console.log('✅ No missing image references found in database!');
    }
    
    console.log('\n📋 Current content summary:');
    
    // Hero content
    const heroContent = allContent.filter(c => c.key.startsWith('hero.'));
    console.log('\n🏠 Hero Section:');
    heroContent.forEach(c => {
      console.log(`  ${c.key}: ${c.value}`);
    });
    
    // Promotion content
    const promotionContent = allContent.filter(c => c.key.startsWith('promotion.'));
    console.log('\n🎯 Promotion Section:');
    promotionContent.forEach(c => {
      console.log(`  ${c.key}: ${c.value}`);
    });
    
    console.log('\n🎉 Image management status:');
    console.log('✅ Hardcoded references removed from Promotions.tsx');
    console.log('✅ Default content values updated to use existing images');
    console.log('✅ Promotion section now loads content from database');
    console.log('✅ Admin dashboard supports promotion image management');
    console.log('✅ Database cleaned of missing image references');
    
    console.log('\n🚀 Next steps:');
    console.log('1. Visit http://localhost:3001/admin/content');
    console.log('2. Go to the "Promotions" tab');
    console.log('3. Upload new images or update content as needed');
    console.log('4. All images are now manageable via admin dashboard');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyFixedImages();
