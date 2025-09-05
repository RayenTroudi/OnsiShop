require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testHeroImageFlow() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testing hero background image flow...');
    
    // 1. Get current hero background image
    const currentHeroImage = await prisma.siteContent.findUnique({
      where: { key: 'hero.backgroundImage' }
    });
    console.log('📸 Current hero background image:', currentHeroImage?.value || 'Not set');
    
    // 2. Check if the image file exists
    const fs = require('fs');
    const path = require('path');
    
    if (currentHeroImage?.value) {
      const imagePath = path.join(__dirname, 'public', currentHeroImage.value);
      const exists = fs.existsSync(imagePath);
      console.log(`📁 Image file exists at ${imagePath}:`, exists);
    }
    
    // 3. Verify all hero content is properly set
    const allHeroContent = await prisma.siteContent.findMany({
      where: {
        key: {
          startsWith: 'hero.'
        }
      }
    });
    
    console.log('\n📋 All hero content:');
    allHeroContent.forEach(content => {
      console.log(`  - ${content.key}: ${content.value}`);
    });
    
    console.log('\n✅ Hero image flow test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testHeroImageFlow();
