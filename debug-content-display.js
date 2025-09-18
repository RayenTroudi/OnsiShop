const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugContentDisplay() {
  try {
    console.log('🔍 Debugging content display issue...\n');
    
    // Check SiteContent table
    console.log('📋 SiteContent entries:');
    const siteContent = await prisma.siteContent.findMany({
      where: {
        key: {
          in: ['hero_title', 'hero_subtitle', 'hero_description', 'promotion_title']
        }
      }
    });
    
    siteContent.forEach(item => {
      console.log(`  ${item.key}: "${item.value}"`);
    });
    
    if (siteContent.length === 0) {
      console.log('  ⚠️  No SiteContent entries found - this might be the issue!');
    }
    
    // Check what the content API would return
    console.log('\n🔍 Testing content API response...');
    const allContent = await prisma.siteContent.findMany();
    const contentMap = {};
    allContent.forEach(item => {
      contentMap[item.key] = item.value;
    });
    
    console.log('\n📤 Content API would return:');
    console.log('hero_title:', contentMap.hero_title || 'NOT FOUND');
    console.log('hero_subtitle:', contentMap.hero_subtitle || 'NOT FOUND');
    console.log('hero_description:', contentMap.hero_description || 'NOT FOUND');
    console.log('promotion_title:', contentMap.promotion_title || 'NOT FOUND');
    
    // Check if we have translation keys instead
    const translationLikeEntries = await prisma.siteContent.findMany({
      where: {
        value: {
          in: ['hero_title', 'promo_title', 'about_title']
        }
      }
    });
    
    if (translationLikeEntries.length > 0) {
      console.log('\n⚠️  Found entries with translation keys as values:');
      translationLikeEntries.forEach(item => {
        console.log(`  ${item.key} = "${item.value}" (PROBLEM!)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugContentDisplay();