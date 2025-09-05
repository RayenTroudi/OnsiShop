require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function fixMissingImageReferences() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing missing image references...\n');
    
    // 1. Update Promotions component to use placeholder.jpg instead
    console.log('📝 Will update Promotions.tsx to use existing image...');
    
    // 2. Update default content values in content.ts
    console.log('📝 Will update default content values...');
    
    // 3. Clean up any database references to missing images
    console.log('🗑️ Cleaning up database references...');
    
    // Remove any content that references missing images
    const missingImagePaths = [
      '/images/promotions/winter.jpg',
      '/images/background-image-1756043891412-0nifzaa2fwm.PNG',
      '/uploads/1756809700099-ody6en5rc9h.webp'
    ];
    
    for (const imagePath of missingImagePaths) {
      const contentToUpdate = await prisma.siteContent.findMany({
        where: {
          value: imagePath
        }
      });
      
      if (contentToUpdate.length > 0) {
        console.log(`🔄 Found ${contentToUpdate.length} content entries with missing image: ${imagePath}`);
        for (const content of contentToUpdate) {
          console.log(`  - Updating ${content.key}: ${content.value} -> /images/placeholder.jpg`);
          await prisma.siteContent.update({
            where: { id: content.id },
            data: { value: '/images/placeholder.jpg' }
          });
        }
      }
    }
    
    // 4. Update hero.backgroundImage specifically if it's using missing image
    const heroImage = await prisma.siteContent.findUnique({
      where: { key: 'hero.backgroundImage' }
    });
    
    if (heroImage && missingImagePaths.includes(heroImage.value)) {
      console.log('🔄 Updating hero.backgroundImage to use existing image...');
      await prisma.siteContent.update({
        where: { key: 'hero.backgroundImage' },
        data: { value: '/images/placeholder.jpg' }
      });
    }
    
    console.log('\n✅ Database cleanup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Update Promotions.tsx to use /images/placeholder.jpg');
    console.log('2. Update content.ts default values to use existing images');
    console.log('3. Create missing image files or update references');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingImageReferences();
