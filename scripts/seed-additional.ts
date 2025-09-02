import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding additional data...');

  // Create navigation items
  const homeNav = await prisma.navigationItem.create({
    data: {
      name: 'home',
      title: 'Home',
      url: '/',
      order: 1,
      isPublished: true,
    },
  });

  const shopNav = await prisma.navigationItem.create({
    data: {
      name: 'shop',
      title: 'Shop',
      url: '/search',
      order: 2,
      isPublished: true,
    },
  });

  const categoriesNav = await prisma.navigationItem.create({
    data: {
      name: 'categories',
      title: 'Categories',
      url: '/search',
      order: 3,
      isPublished: true,
    },
  });

  // Create category sub-navigation
  await prisma.navigationItem.create({
    data: {
      name: 'clothing',
      title: 'Clothing',
      url: '/search/clothing',
      order: 1,
      isPublished: true,
      parentId: categoriesNav.id,
    },
  });

  await prisma.navigationItem.create({
    data: {
      name: 'accessories',
      title: 'Accessories',
      url: '/search/accessories',
      order: 2,
      isPublished: true,
      parentId: categoriesNav.id,
    },
  });

  const aboutNav = await prisma.navigationItem.create({
    data: {
      name: 'about',
      title: 'About',
      url: '/about-us',
      order: 4,
      isPublished: true,
    },
  });

  console.log('✅ Navigation items created');

  // Create site content
  const contentItems = [
    { key: 'hero.title', value: 'Welcome to ONSI Fashion' },
    { key: 'hero.subtitle', value: 'Discover the Perfect Blend of Style and Comfort' },
    { key: 'hero.description', value: 'Shop our exclusive collection of premium clothing for men and women. From casual wear to formal attire, find your perfect style with our carefully curated fashion pieces.' },
    { key: 'hero.primaryButtonText', value: 'Shop Collection' },
    { key: 'hero.secondaryButtonText', value: 'Learn More' },
    { key: 'hero.backgroundImage', value: '/images/promotions/winter.jpg' },
    
    { key: 'about.title', value: 'Crafted with Passion, Designed for You' },
    { key: 'about.description', value: 'We believe that fashion is more than just clothing - it is a form of self-expression. Our carefully curated collection combines timeless elegance with contemporary trends, ensuring you always look and feel your best.' },
    { key: 'about.buttonText', value: 'Our Story' },
    { key: 'about.backgroundImage', value: '/images/about-background.jpg' },
    
    { key: 'footer.companyName', value: 'ONSI Fashion' },
    { key: 'footer.tagline', value: 'Your Style, Our Passion' },
    { key: 'footer.description', value: 'Premium fashion for the modern lifestyle. Quality, style, and comfort in every piece.' },
    { key: 'footer.copyrightText', value: '© 2025 ONSI Fashion. All rights reserved.' },
    
    { key: 'contact.email', value: 'hello@onsifashion.com' },
    { key: 'contact.phone', value: '+1 (555) 123-ONSI' },
    { key: 'contact.address', value: '123 Fashion Avenue, Style District, New York, NY 10001' },
    
    { key: 'seo.title', value: 'ONSI Fashion - Premium Clothing Store' },
    { key: 'seo.description', value: 'Discover premium fashion at ONSI. Shop our collection of high-quality clothing for men and women. Style, comfort, and quality in every piece.' },
    { key: 'seo.keywords', value: 'fashion, clothing, premium, style, men, women, apparel, online store' },
  ];

  for (const item of contentItems) {
    await prisma.siteContent.upsert({
      where: { key: item.key },
      update: { value: item.value },
      create: { key: item.key, value: item.value },
    });
  }

  console.log('✅ Site content created');

  // Create social media links
  const socialMediaItems = [
    {
      platform: 'twitter',
      title: 'X (Twitter)',
      url: 'https://twitter.com/onsifashion',
      iconUrl: '/images/footer/social-media/x.png',
      order: 1,
    },
    {
      platform: 'facebook',
      title: 'Facebook',
      url: 'https://facebook.com/onsifashion',
      iconUrl: '/images/footer/social-media/facebook.png',
      order: 2,
    },
    {
      platform: 'instagram',
      title: 'Instagram',
      url: 'https://instagram.com/onsifashion',
      iconUrl: '/images/footer/social-media/instagram.png',
      order: 3,
    },
    {
      platform: 'youtube',
      title: 'YouTube',
      url: 'https://youtube.com/onsifashion',
      iconUrl: '/images/footer/social-media/youtube.png',
      order: 4,
    },
    {
      platform: 'tiktok',
      title: 'TikTok',
      url: 'https://tiktok.com/@onsifashion',
      iconUrl: '/images/footer/social-media/tiktok.png',
      order: 5,
    },
  ];

  for (const item of socialMediaItems) {
    await prisma.socialMedia.create({
      data: item,
    });
  }

  console.log('✅ Social media items created');
  console.log('🌱 Additional data seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
