const { PrismaClient } = require('@prisma/client');

const DEFAULT_SITE_CONTENT = {
  'hero.title': 'Welcome to Our Clothing Store',
  'hero.subtitle': 'Discover the latest fashion trends and styles',
  'hero.description': 'Shop our collection of high-quality clothing for men and women. From casual wear to formal attire, we have everything you need to look your best.',
  'hero.buttonText': 'Shop Now',
  'hero.backgroundVideo': '/videos/clothing-shoot.mp4',
  'about.title': 'About Our Store',
  'about.description': 'We are passionate about bringing you the finest clothing at affordable prices. Our curated collection features the latest trends and timeless classics.',
  'about.backgroundImage': '/images/background-image-1756043891412-0nifzaa2fwm.PNG',
  'footer.companyName': 'OnsiShop',
  'footer.description': 'Your premium fashion destination',
  'contact.email': 'contact@onsishop.com',
  'contact.phone': '+1 (555) 123-4567',
  'contact.address': '123 Fashion Street, Style City, SC 12345'
};

async function restoreSiteContent() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Restoring SiteContent...\n');
    
    // Clear existing content (if any)
    await prisma.siteContent.deleteMany();
    
    // Add default content
    const contentItems = Object.entries(DEFAULT_SITE_CONTENT).map(([key, value]) => ({
      key,
      value
    }));
    
    await prisma.siteContent.createMany({
      data: contentItems
    });
    
    console.log(`✅ Successfully created ${contentItems.length} content items:`);
    contentItems.forEach(item => {
      console.log(`   - ${item.key}: ${item.value.substring(0, 60)}${item.value.length > 60 ? '...' : ''}`);
    });
    
    console.log('\n🎉 SiteContent has been restored!');
    console.log('You can now customize it at: http://localhost:3000/admin/content');
    
  } catch (error) {
    console.error('❌ Error restoring content:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

restoreSiteContent();
