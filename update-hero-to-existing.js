require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function updateHeroImageToExisting() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🖼️ Updating hero background image to existing image...');
    
    // Update hero background image to use placeholder.jpg which exists
    const heroImage = await prisma.siteContent.upsert({
      where: { key: 'hero.backgroundImage' },
      update: { value: '/images/placeholder.jpg' },
      create: {
        key: 'hero.backgroundImage',
        value: '/images/placeholder.jpg'
      }
    });
    
    console.log('✅ Hero background image updated to existing image:', heroImage);
    
    // Verify the file exists
    const fs = require('fs');
    const path = require('path');
    const imagePath = path.join(__dirname, 'public', heroImage.value);
    const exists = fs.existsSync(imagePath);
    console.log(`📁 Image file exists at ${imagePath}:`, exists);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateHeroImageToExisting();
