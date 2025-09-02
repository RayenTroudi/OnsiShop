import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runCompleteSeed() {
  try {
    console.log('🚀 Running complete database seeding...');
    
    // 1. Run the main seed first
    console.log('\n1️⃣ Running main seed...');
    // Note: The main seed would need to be called separately
    console.log('⚠️  Run `npm run db:seed` first, then run additional seeds');
    
    console.log('\n2️⃣ Adding additional data...');
    
    // 2. Navigation and social media
    await seedNavigation();
    
    // 3. Additional products with variants
    await seedAdditionalProducts();
    
    // 4. Missing categories and relationships
    await seedMissingData();
    
    // 5. Media assets
    await seedMediaAssets();
    
    // 6. Background content
    await seedBackgroundContent();
    
    console.log('\n🎉 Complete seeding finished successfully!');
    
    // Final summary
    const summary = await getDatabaseSummary();
    console.log('\n📊 Final Database Summary:');
    console.log(`   👥 Users: ${summary.users}`);
    console.log(`   🏷️  Categories: ${summary.categories}`);
    console.log(`   📦 Products: ${summary.products}`);
    console.log(`   📄 Site Content: ${summary.content}`);
    console.log(`   🧭 Navigation: ${summary.navigation}`);
    console.log(`   📱 Social Media: ${summary.social}`);
    console.log(`   🎬 Media Assets: ${summary.media}`);
    
  } catch (error) {
    console.error('❌ Error during complete seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedNavigation() {
  // Create navigation items
  const navigationItems = [
    { name: 'home', title: 'Home', url: '/', order: 1, isPublished: true },
    { name: 'shop', title: 'Shop', url: '/search', order: 2, isPublished: true },
    { name: 'categories', title: 'Categories', url: '/search', order: 3, isPublished: true },
    { name: 'about', title: 'About', url: '/about-us', order: 4, isPublished: true }
  ];

  for (const navData of navigationItems) {
    await prisma.navigationItem.upsert({
      where: { name: navData.name },
      update: navData,
      create: navData
    });
  }

  // Add sub-navigation
  const categoriesNav = await prisma.navigationItem.findUnique({ where: { name: 'categories' } });
  if (categoriesNav) {
    const subNavItems = [
      { name: 'clothing', title: 'Clothing', url: '/search/clothing', order: 1, isPublished: true, parentId: categoriesNav.id },
      { name: 'accessories', title: 'Accessories', url: '/search/accessories', order: 2, isPublished: true, parentId: categoriesNav.id }
    ];

    for (const subNavData of subNavItems) {
      await prisma.navigationItem.upsert({
        where: { name: subNavData.name },
        update: subNavData,
        create: subNavData
      });
    }
  }

  // Social media
  const socialMediaItems = [
    { platform: 'twitter', title: 'X (Twitter)', url: 'https://twitter.com/onsifashion', iconUrl: '/images/footer/social-media/x.png', order: 1 },
    { platform: 'facebook', title: 'Facebook', url: 'https://facebook.com/onsifashion', iconUrl: '/images/footer/social-media/facebook.png', order: 2 },
    { platform: 'instagram', title: 'Instagram', url: 'https://instagram.com/onsifashion', iconUrl: '/images/footer/social-media/instagram.png', order: 3 },
    { platform: 'youtube', title: 'YouTube', url: 'https://youtube.com/onsifashion', iconUrl: '/images/footer/social-media/youtube.png', order: 4 },
    { platform: 'tiktok', title: 'TikTok', url: 'https://tiktok.com/@onsifashion', iconUrl: '/images/footer/social-media/tiktok.png', order: 5 }
  ];

  for (const socialData of socialMediaItems) {
    await prisma.socialMedia.upsert({
      where: { platform: socialData.platform },
      update: socialData,
      create: socialData
    });
  }

  console.log('✅ Navigation and social media seeded');
}

async function seedAdditionalProducts() {
  // Get categories
  const clothing = await prisma.category.findUnique({ where: { handle: 'clothing' } });
  const accessories = await prisma.category.findUnique({ where: { handle: 'accessories' } });
  const shoes = await prisma.category.findUnique({ where: { handle: 'shoes' } });

  // Create categories if they don't exist
  const clothingCategory = clothing || await prisma.category.create({
    data: { name: 'Clothing', handle: 'clothing', description: 'All clothing items' }
  });

  const accessoriesCategory = accessories || await prisma.category.create({
    data: { name: 'Accessories', handle: 'accessories', description: 'Watches, jewelry, and accessories' }
  });

  const additionalProducts = [
    {
      handle: 'cotton-hoodie-comfortable',
      title: 'Comfortable Cotton Hoodie',
      description: 'Soft and cozy cotton hoodie perfect for casual wear.',
      price: 65.99,
      compareAtPrice: 89.99,
      availableForSale: true,
      categoryId: clothingCategory.id,
      tags: JSON.stringify(['hoodie', 'cotton', 'casual']),
      variants: JSON.stringify([
        { id: 'hoodie-s-gray', title: 'Small / Gray', price: 65.99, availableForSale: true, selectedOptions: [{ name: 'Size', value: 'Small' }, { name: 'Color', value: 'Gray' }] },
        { id: 'hoodie-m-gray', title: 'Medium / Gray', price: 65.99, availableForSale: true, selectedOptions: [{ name: 'Size', value: 'Medium' }, { name: 'Color', value: 'Gray' }] },
        { id: 'hoodie-l-black', title: 'Large / Black', price: 65.99, availableForSale: true, selectedOptions: [{ name: 'Size', value: 'Large' }, { name: 'Color', value: 'Black' }] }
      ])
    },
    {
      handle: 'watch-minimal-silver',
      title: 'Minimal Silver Watch',
      description: 'Elegant minimalist watch with silver band.',
      price: 149.99,
      compareAtPrice: 199.99,
      availableForSale: true,
      categoryId: accessoriesCategory.id,
      tags: JSON.stringify(['watch', 'silver', 'minimal']),
      variants: JSON.stringify([
        { id: 'watch-silver', title: 'Silver', price: 149.99, availableForSale: true, selectedOptions: [{ name: 'Color', value: 'Silver' }] }
      ])
    }
  ];

  for (const productData of additionalProducts) {
    await prisma.product.upsert({
      where: { handle: productData.handle },
      update: productData,
      create: productData
    });
  }

  console.log('✅ Additional products with variants seeded');
}

async function seedMissingData() {
  // Ensure all required categories exist
  const requiredCategories = [
    { name: 'Clothing', handle: 'clothing', description: 'All clothing items' },
    { name: 'Accessories', handle: 'accessories', description: 'Watches, jewelry, and accessories' }
  ];

  for (const categoryData of requiredCategories) {
    await prisma.category.upsert({
      where: { handle: categoryData.handle },
      update: categoryData,
      create: categoryData
    });
  }

  console.log('✅ Missing categories ensured');
}

async function seedMediaAssets() {
  const mediaAssets = [
    { filename: 'logo.png', url: '/images/logo.png', alt: 'ONSI Fashion logo', type: 'IMAGE', section: 'header' },
    { filename: 'cart.png', url: '/images/cart.png', alt: 'Shopping cart icon', type: 'IMAGE', section: 'header' },
    { filename: 'winter.jpg', url: '/images/promotions/winter.jpg', alt: 'Winter collection', type: 'IMAGE', section: 'hero' },
    { filename: 'clothing-shoot.mp4', url: '/videos/clothing-shoot.mp4', alt: 'Clothing video', type: 'VIDEO', section: 'hero' }
  ];

  for (const assetData of mediaAssets) {
    await prisma.mediaAsset.upsert({
      where: { filename: assetData.filename },
      update: assetData,
      create: assetData
    });
  }

  console.log('✅ Media assets seeded');
}

async function seedBackgroundContent() {
  const additionalContent = [
    { key: 'hero.primaryButtonText', value: 'Shop Collection' },
    { key: 'hero.secondaryButtonText', value: 'Learn More' },
    { key: 'hero.backgroundImage', value: '/images/promotions/winter.jpg' },
    { key: 'about.buttonText', value: 'Our Story' },
    { key: 'footer.tagline', value: 'Your Style, Our Passion' },
    { key: 'footer.copyrightText', value: '© 2025 ONSI Fashion. All rights reserved.' }
  ];

  for (const contentData of additionalContent) {
    await prisma.siteContent.upsert({
      where: { key: contentData.key },
      update: { value: contentData.value },
      create: contentData
    });
  }

  console.log('✅ Background content seeded');
}

async function getDatabaseSummary() {
  const [users, categories, products, content, navigation, social, media] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.product.count(),
    prisma.siteContent.count(),
    prisma.navigationItem.count(),
    prisma.socialMedia.count(),
    prisma.mediaAsset.count()
  ]);

  return { users, categories, products, content, navigation, social, media };
}

// Run if called directly
if (require.main === module) {
  runCompleteSeed().catch(console.error);
}

export default runCompleteSeed;
