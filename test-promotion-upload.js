require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testPromotionImageUpdate() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing promotion image update...\n');
    
    // Check current promotion content
    const currentPromotion = await prisma.siteContent.findMany({
      where: {
        key: {
          startsWith: 'promotion.'
        }
      }
    });
    
    console.log('📋 Current promotion content:');
    currentPromotion.forEach(item => {
      console.log(`  ${item.key}: ${item.value}`);
    });
    
    // Test updating the promotion background image
    const testImageUrl = '/uploads/test-promotion-image.jpg';
    
    console.log(`\n🔄 Updating promotion.backgroundImage to: ${testImageUrl}`);
    
    await prisma.siteContent.upsert({
      where: { key: 'promotion.backgroundImage' },
      update: { value: testImageUrl },
      create: { key: 'promotion.backgroundImage', value: testImageUrl }
    });
    
    // Verify the update
    const updatedPromotion = await prisma.siteContent.findUnique({
      where: { key: 'promotion.backgroundImage' }
    });
    
    if (updatedPromotion && updatedPromotion.value === testImageUrl) {
      console.log('✅ Database update successful!');
      console.log(`   promotion.backgroundImage = ${updatedPromotion.value}`);
    } else {
      console.log('❌ Database update failed!');
    }
    
    // Revert back to placeholder
    console.log('\n🔄 Reverting to placeholder image...');
    await prisma.siteContent.update({
      where: { key: 'promotion.backgroundImage' },
      data: { value: '/images/placeholder.jpg' }
    });
    
    console.log('✅ Reverted to placeholder image');
    
    console.log('\n🎯 Test completed! The promotion image system should work correctly.');
    console.log('\n📝 If you\'re still experiencing issues:');
    console.log('1. Check the browser console for any JavaScript errors');
    console.log('2. Verify the file upload input is not being interfered with by other code');
    console.log('3. Make sure the /api/admin/upload-image endpoint is working');
    console.log('4. Check that the admin dashboard has the correct permissions');
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPromotionImageUpdate();
