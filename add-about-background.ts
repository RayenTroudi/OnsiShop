import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addAboutBackgroundImage() {
  try {
    const existing = await prisma.siteContent.findUnique({
      where: { key: 'about.backgroundImage' }
    });

    if (!existing) {
      await prisma.siteContent.create({
        data: {
          key: 'about.backgroundImage',
          value: '/images/about-background.jpg'
        }
      });
      console.log('✅ Added about.backgroundImage to database');
    } else {
      console.log('ℹ️ about.backgroundImage already exists:', existing.value);
    }

    const aboutContent = await prisma.siteContent.findMany({
      where: {
        key: {
          startsWith: 'about.'
        }
      }
    });

    console.log('📋 About content in database:');
    aboutContent.forEach(item => {
      console.log(`  ${item.key}: ${item.value}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAboutBackgroundImage();
