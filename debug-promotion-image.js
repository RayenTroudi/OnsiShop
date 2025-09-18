const { PrismaClient } = require('@prisma/client');

async function debugPromotionImage() {
  console.log('🎯 Debugging Promotion Image Display...');
  const prisma = new PrismaClient();
  
  try {
    // Check what we have in the database for promotions
    const promoImage = await prisma.siteContent.findUnique({
      where: { key: 'promotion_background_image' }
    });
    
    const promoTitle = await prisma.siteContent.findUnique({
      where: { key: 'promotion_title' }
    });
    
    const promoSubtitle = await prisma.siteContent.findUnique({
      where: { key: 'promotion_subtitle' }
    });

    console.log('\n📋 Database Content:');
    console.log('🖼️ Promotion Image:');
    if (promoImage && promoImage.value) {
      console.log('  ✅ Found in database');
      console.log(`  📏 Size: ${(promoImage.value.length / 1024).toFixed(0)} KB`);
      console.log(`  🕒 Updated: ${promoImage.updatedAt}`);
      console.log(`  🔗 Type: ${promoImage.value.startsWith('data:') ? 'Base64 Data URL' : 'Regular URL'}`);
      console.log(`  📝 Preview: ${promoImage.value.substring(0, 50)}...`);
    } else {
      console.log('  ❌ Not found in database');
    }

    console.log('\n📝 Promotion Text:');
    console.log('  Title:', promoTitle?.value || 'Not set');
    console.log('  Subtitle:', promoSubtitle?.value || 'Not set');

    // Test what the API would return
    console.log('\n🔍 Testing API Response:');
    const allContent = await prisma.siteContent.findMany();
    const contentMap = {};
    allContent.forEach(item => {
      if (item.key && item.value) {
        contentMap[item.key] = item.value;
      }
    });

    console.log('📤 API would return:');
    console.log('  promotion_background_image:', contentMap['promotion_background_image'] ? 
      `${(contentMap['promotion_background_image'].length / 1024).toFixed(0)}KB` : 'undefined');
    console.log('  promotion_title:', contentMap['promotion_title'] || 'undefined');
    console.log('  promotion_subtitle:', contentMap['promotion_subtitle'] || 'undefined');

    // Check MediaAsset table for promotion images
    console.log('\n📦 MediaAsset Records (Promotions):');
    const promotionAssets = await prisma.mediaAsset.findMany({
      where: { 
        OR: [
          { section: 'promotion' },
          { section: 'promotions' }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    if (promotionAssets.length > 0) {
      console.log(`  Found ${promotionAssets.length} promotion assets:`);
      promotionAssets.forEach((asset, index) => {
        console.log(`  ${index + 1}. ${asset.filename}`);
        console.log(`     Type: ${asset.type}`);
        console.log(`     Section: ${asset.section}`);
        console.log(`     Size: ${asset.url ? (asset.url.length / 1024).toFixed(0) : '0'} KB`);
        console.log(`     Created: ${asset.createdAt}`);
      });
    } else {
      console.log('  ❌ No promotion assets found');
    }

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugPromotionImage();