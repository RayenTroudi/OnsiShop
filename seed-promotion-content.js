require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function seedPromotionContent() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 Seeding promotion content...\n');
    
    const promotionContent = [
      {
        key: 'promotion.title',
        value: 'Stay Warm,\nStay Stylish'
      },
      {
        key: 'promotion.subtitle',
        value: 'Stay cozy and fashionable this winter with our winter collection!'
      },
      {
        key: 'promotion.buttonText',
        value: 'View Collection'
      },
      {
        key: 'promotion.buttonLink',
        value: '/search/winter-2024'
      },
      {
        key: 'promotion.backgroundImage',
        value: '/images/placeholder.jpg'
      }
    ];
    
    for (const item of promotionContent) {
      const existing = await prisma.siteContent.findUnique({
        where: { key: item.key }
      });
      
      if (existing) {
        console.log(`⚠️  Content already exists: ${item.key} = "${existing.value}"`);
      } else {
        await prisma.siteContent.create({
          data: item
        });
        console.log(`✅ Created: ${item.key} = "${item.value}"`);
      }
    }
    
    console.log('\n🎉 Promotion content seeding completed!');
    console.log('\n📋 You can now:');
    console.log('1. Visit /admin/content and go to the "Promotions" tab');
    console.log('2. Upload a new promotion background image');
    console.log('3. Edit the promotion text content');
    console.log('4. The website will automatically load the new content');
    
  } catch (error) {
    console.error('❌ Error seeding promotion content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPromotionContent();
