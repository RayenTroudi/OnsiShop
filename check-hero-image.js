require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function checkHeroImage() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking hero background image in database...');
    
    const heroImage = await prisma.siteContent.findUnique({
      where: { key: 'hero.backgroundImage' }
    });
    
    console.log('Hero background image content:', heroImage);
    
    // Also check all content to see what's available
    const allContent = await prisma.siteContent.findMany({
      where: {
        key: {
          contains: 'hero'
        }
      }
    });
    
    console.log('\nAll hero-related content:');
    allContent.forEach(item => {
      console.log(`- ${item.key}: ${item.value}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHeroImage();
