// Direct API test to bypass content-manager issues

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDirectAPI() {
  try {
    console.log('🔍 Direct Database Test...\n');
    
    // 1. Test direct database query
    console.log('1. Checking database content directly...');
    const allContent = await prisma.siteContent.findMany({
      where: {
        key: {
          contains: 'promotion'
        }
      }
    });
    
    console.log('Found promotion content:', allContent.length);
    allContent.forEach(item => {
      console.log(`  ${item.key}: ${item.value.length} chars`);
    });
    
    // 2. Check specific key
    const promotionImage = await prisma.siteContent.findUnique({
      where: {
        key: 'promotion_background_image'
      }
    });
    
    if (promotionImage) {
      console.log('\n✅ promotion_background_image found in database');
      console.log('Length:', promotionImage.value.length);
      console.log('Is Base64?', promotionImage.value.startsWith('data:'));
    } else {
      console.log('\n❌ promotion_background_image NOT found in database');
    }
    
    // 3. Test simple content fetch without content-manager
    console.log('\n2. Testing simple content fetch...');
    const simpleContent = await prisma.siteContent.findMany({
      select: {
        key: true,
        value: true
      }
    });
    
    const contentMap = {};
    simpleContent.forEach(item => {
      contentMap[item.key] = item.value;
    });
    
    console.log('Simple fetch result:');
    console.log('promotion_background_image exists?', !!contentMap['promotion_background_image']);
    
    if (contentMap['promotion_background_image']) {
      console.log('Length:', contentMap['promotion_background_image'].length);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectAPI();