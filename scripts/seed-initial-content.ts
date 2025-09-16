import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedContent() {
  console.log('🌱 Seeding initial content...');

  const defaultContent = [
    { key: 'hero_title', value: 'Welcome to Our Fashion Store' },
    { key: 'hero_subtitle', value: 'Discover the Latest Trends' },
    { key: 'hero_description', value: 'Shop our collection of high-quality clothing for men and women. From casual wear to formal attire, we have everything you need to look your best.' },
    { key: 'hero_button_text', value: 'Shop Now' },
    { key: 'about_title', value: 'About Our Store' },
    { key: 'about_description', value: 'We are passionate about bringing you the finest clothing at affordable prices. Our curated collection features the latest trends and timeless classics.' },
    { key: 'footer_company_name', value: 'OnsiShop' },
    { key: 'footer_description', value: 'Your Fashion Destination' },
    { key: 'contact_email', value: 'contact@onsishop.com' },
    { key: 'contact_phone', value: '+1 (555) 123-4567' },
    { key: 'contact_address', value: '123 Fashion Street, Style City, SC 12345' },
    { key: 'promotion_title', value: 'Winter Collection\nNow Available' },
    { key: 'promotion_subtitle', value: 'Stay cozy and fashionable this winter with our new collection!' },
    { key: 'promotion_button_text', value: 'View Collection' },
    { key: 'promotion_button_link', value: '/search/winter-2024' },
  ];

  let addedCount = 0;
  let skippedCount = 0;

  for (const content of defaultContent) {
    try {
      // Check if content already exists
      const existing = await prisma.siteContent.findUnique({
        where: { key: content.key }
      });

      if (existing) {
        console.log(`⚠️  Content '${content.key}' already exists, skipping...`);
        skippedCount++;
        continue;
      }

      // Create new content
      await prisma.siteContent.create({
        data: content
      });
      
      console.log(`✅ Added content: ${content.key}`);
      addedCount++;
    } catch (error) {
      console.error(`❌ Error adding content '${content.key}':`, error);
    }
  }

  console.log(`\n🎉 Content seeding completed!`);
  console.log(`📊 Added: ${addedCount} items`);
  console.log(`📊 Skipped: ${skippedCount} items`);
  console.log(`📊 Total content items: ${addedCount + skippedCount}`);
}

seedContent()
  .catch((e) => {
    console.error('❌ Error seeding content:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });