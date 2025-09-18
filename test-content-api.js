const { PrismaClient } = require('@prisma/client');

async function testContentAPI() {
  console.log('🧪 Testing Content API Data...');
  const prisma = new PrismaClient();
  
  try {
    // Check what we have in the database
    const heroVideo = await prisma.siteContent.findUnique({
      where: { key: 'hero_background_video' }
    });
    
    const promoImage = await prisma.siteContent.findUnique({
      where: { key: 'promotion_background_image' }
    });

    console.log('\n🎬 Hero Video Status:');
    if (heroVideo && heroVideo.value) {
      console.log('✅ Found in database');
      console.log('   Size:', heroVideo.value.length, 'chars');
      console.log('   Type:', heroVideo.value.startsWith('data:') ? 'Base64 Data URL' : 'Regular URL');
      console.log('   Updated:', heroVideo.updatedAt);
      console.log('   Preview:', heroVideo.value.substring(0, 50) + '...');
    } else {
      console.log('❌ Not found in database');
    }

    console.log('\n🖼️ Promo Image Status:');
    if (promoImage && promoImage.value) {
      console.log('✅ Found in database');
      console.log('   Size:', promoImage.value.length, 'chars');
      console.log('   Type:', promoImage.value.startsWith('data:') ? 'Base64 Data URL' : 'Regular URL');
      console.log('   Updated:', promoImage.updatedAt);
      console.log('   Preview:', promoImage.value.substring(0, 50) + '...');
    } else {
      console.log('❌ Not found in database');
    }

    // Also check all content keys for reference
    console.log('\n📋 All Content Keys:');
    const allContent = await prisma.siteContent.findMany({
      select: { key: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    allContent.forEach((item, index) => {
      console.log(`${index + 1}. ${item.key} (${item.updatedAt})`);
    });

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testContentAPI();