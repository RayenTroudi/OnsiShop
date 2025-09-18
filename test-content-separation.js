const { PrismaClient } = require('@prisma/client');

async function testContentSeparation() {
  console.log('🧪 Testing Content Key Separation...');
  const prisma = new PrismaClient();
  
  try {
    // Check current state
    console.log('\n📋 Current Content State:');
    
    const heroVideo = await prisma.siteContent.findUnique({
      where: { key: 'hero_background_video' }
    });
    
    const heroImage = await prisma.siteContent.findUnique({
      where: { key: 'hero_background_image' }
    });
    
    const promoImage = await prisma.siteContent.findUnique({
      where: { key: 'promotion_background_image' }
    });

    console.log('🎬 Hero Video:', heroVideo ? `${(heroVideo.value.length / 1024 / 1024).toFixed(2)}MB (${heroVideo.updatedAt})` : 'None');
    console.log('🖼️ Hero Image:', heroImage ? `${heroImage.value.length} chars (${heroImage.updatedAt})` : 'None');  
    console.log('🎯 Promo Image:', promoImage ? `${(promoImage.value.length / 1024).toFixed(0)}KB (${promoImage.updatedAt})` : 'None');

    // Check MediaAsset table as well
    console.log('\n📦 MediaAsset Records:');
    
    const heroMedias = await prisma.mediaAsset.findMany({
      where: { section: 'hero' },
      orderBy: { createdAt: 'desc' }
    });
    
    const promoMedias = await prisma.mediaAsset.findMany({
      where: { section: 'promotions' },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`🎬 Hero MediaAssets: ${heroMedias.length}`);
    heroMedias.forEach((media, index) => {
      console.log(`   ${index + 1}. ${media.filename} (${media.type}) - ${media.createdAt}`);
    });

    console.log(`🎯 Promotion MediaAssets: ${promoMedias.length}`);
    promoMedias.forEach((media, index) => {
      console.log(`   ${index + 1}. ${media.filename} (${media.type}) - ${media.createdAt}`);
    });

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('✅ Hero video should be preserved when uploading promotion images');
    console.log('✅ Each section should have separate content keys');
    console.log('✅ MediaAsset cleanup should only affect the uploaded section');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testContentSeparation();