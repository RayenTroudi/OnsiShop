import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addHeroBackgroundImage() {
  try {
    console.log('🖼️ Adding hero background image content...');

    // Check if hero.backgroundImage already exists
    const existingContent = await prisma.siteContent.findUnique({
      where: { key: 'hero.backgroundImage' }
    });

    if (existingContent) {
      console.log('✅ Hero background image content already exists:', existingContent.value);
      return;
    }

    // Add the hero background image content
    const newContent = await prisma.siteContent.create({
      data: {
        key: 'hero.backgroundImage',
        value: '/images/background-image-1756043891412-0nifzaa2fwm.PNG'
      }
    });

    console.log('✅ Hero background image content added:', newContent.value);

    // Verify all hero content
    const heroContent = await prisma.siteContent.findMany({
      where: {
        key: {
          startsWith: 'hero.'
        }
      },
      orderBy: {
        key: 'asc'
      }
    });

    console.log('\n📋 All hero section content:');
    heroContent.forEach(item => {
      console.log(`  ${item.key}: ${item.value}`);
    });

  } catch (error) {
    console.error('❌ Error adding hero background image:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addHeroBackgroundImage();
