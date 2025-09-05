require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function setHeroBackgroundImage() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🖼️ Setting hero background image...');
    
    // Set hero background image to an existing image
    const heroImage = await prisma.siteContent.upsert({
      where: { key: 'hero.backgroundImage' },
      update: { value: '/images/background-image-1756043891412-0nifzaa2fwm.PNG' },
      create: {
        key: 'hero.backgroundImage',
        value: '/images/background-image-1756043891412-0nifzaa2fwm.PNG'
      }
    });
    
    console.log('✅ Hero background image updated:', heroImage);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setHeroBackgroundImage();
