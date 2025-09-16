import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Check if this is the first run (no admin user exists)
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@gmail.com' }
    });

    const isFirstRun = !existingAdmin;
    
    if (isFirstRun) {
      console.log('🧹 First run detected - initializing fresh database...');
      // Only clear data on first run
      await prisma.cartItem.deleteMany();
      await prisma.cart.deleteMany();
      await prisma.product.deleteMany();
      await prisma.category.deleteMany();
      await prisma.siteContent.deleteMany();
      await prisma.user.deleteMany();
      await prisma.navigationItem.deleteMany();
      await prisma.socialMedia.deleteMany();
      await prisma.mediaAsset.deleteMany();
      
      console.log('✅ Database initialized');
    } else {
      console.log('📦 Database already initialized - preserving existing data...');
    }

    // Create default admin user (only if doesn't exist)
    let adminUser;
    if (isFirstRun) {
      const hashedPassword = await bcrypt.hash('admin@gmail.com', 12);
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@gmail.com',
          password: hashedPassword,
          name: 'Administrator',
          role: 'admin',
        },
      });
      console.log('✅ Admin user created (email: admin@gmail.com, password: admin@gmail.com)');
    } else {
      adminUser = existingAdmin;
      console.log('✅ Admin user already exists');
    }

    // Create demo users (only if doesn't exist)
    const existingDemo = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    });
    
    if (!existingDemo) {
      const demoUser = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          password: await bcrypt.hash('demo123', 12),
          name: 'Demo User',
          role: 'user',
        },
      });
      console.log('✅ Demo user created (email: demo@example.com, password: demo123)');
    } else {
      console.log('✅ Demo user already exists');
    }
    console.log('✅ Demo user created (email: demo@example.com, password: demo123)');

    // Create categories with better data structure (only if they don't exist)
    const categories = [
      {
        name: 'Best Sellers',
        handle: 'best-sellers',
        description: 'Our most popular items that customers love.'
      },
      {
        name: 'Dresses',
        handle: 'dresses',
        description: 'Elegant dresses for every occasion.'
      },
      {
        name: 'T-Shirts',
        handle: 't-shirts',
        description: 'Comfortable and stylish t-shirts.'
      },
      {
        name: 'Jeans',
        handle: 'jeans',
        description: 'Premium denim jeans in various styles.'
      },
      {
        name: 'Shoes',
        handle: 'shoes',
        description: 'Footwear for comfort and style.'
      },
      {
        name: 'Bags',
        handle: 'bags',
        description: 'Stylish bags and accessories.'
      },
      {
        name: 'New Arrivals',
        handle: 'new-arrivals',
        description: 'Latest additions to our collection.'
      }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const existingCategory = await prisma.category.findUnique({
        where: { handle: categoryData.handle }
      });
      
      if (!existingCategory) {
        const newCategory = await prisma.category.create({ data: categoryData });
        createdCategories.push(newCategory);
      } else {
        createdCategories.push(existingCategory);
      }
    }
    console.log(`✅ ${createdCategories.length} categories ready (${categories.filter(async c => !(await prisma.category.findUnique({ where: { handle: c.handle } }))).length} new, ${createdCategories.length - categories.filter(async c => !(await prisma.category.findUnique({ where: { handle: c.handle } }))).length} existing)`);

    // Create products with proper relationships (only if they don't exist)
    const products = [
      {
        name: 'Summer Floral Dress',
        handle: 'summer-floral-dress',
        title: 'Summer Floral Dress',
        description: 'Beautiful floral dress perfect for summer occasions.',
        price: 89.99,
        compareAtPrice: 120.00,
        stock: 25,
        image: '/uploads/1755164664582-rf8118eui29.png',
        categoryId: createdCategories.find(c => c.handle === 'dresses')?.id,
        availableForSale: true
      },
      {
        name: 'Classic Denim Jeans',
        handle: 'classic-denim-jeans',
        title: 'Classic Denim Jeans',
        description: 'Timeless denim jeans that never go out of style.',
        price: 79.99,
        compareAtPrice: 100.00,
        stock: 30,
        categoryId: createdCategories.find(c => c.handle === 'jeans')?.id,
        availableForSale: true
      },
      {
        name: 'Basic Cotton T-Shirt',
        handle: 'basic-cotton-t-shirt',
        title: 'Basic Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt in various colors.',
        price: 24.99,
        compareAtPrice: 35.00,
        stock: 50,
        categoryId: createdCategories.find(c => c.handle === 't-shirts')?.id,
        availableForSale: true
      },
      {
        name: 'Sport Running Shoes',
        handle: 'sport-running-shoes',
        title: 'Sport Running Shoes',
        description: 'High-performance running shoes for athletes.',
        price: 129.99,
        compareAtPrice: 160.00,
        stock: 15,
        categoryId: createdCategories.find(c => c.handle === 'shoes')?.id,
        availableForSale: true
      },
      {
        name: 'Classic Leather Handbag',
        handle: 'classic-leather-handbag',
        title: 'Classic Leather Handbag',
        description: 'Elegant leather handbag perfect for any occasion.',
        price: 199.99,
        compareAtPrice: 250.00,
        stock: 12,
        image: '/uploads/1755165117062-c1lbki9nyvj.jpg',
        categoryId: createdCategories.find(c => c.handle === 'bags')?.id,
        availableForSale: true
      }
    ];

    const createdProducts = [];
    for (const productData of products) {
      const existingProduct = await prisma.product.findUnique({
        where: { handle: productData.handle }
      });
      
      if (!existingProduct) {
        const newProduct = await prisma.product.create({ data: productData });
        createdProducts.push(newProduct);
      } else {
        createdProducts.push(existingProduct);
      }
    }
    console.log(`✅ ${createdProducts.length} products ready`);

    console.log(`✅ ${createdProducts.length} products ready`);

    // Create default site content (only if it doesn't exist)
    const siteContentData = [
      { key: 'hero.title', value: 'Welcome to OnsiShop' },
      { key: 'hero.subtitle', value: 'Discover Premium Fashion & Style' },
      { key: 'hero.description', value: 'Shop our curated collection of high-quality clothing for men and women. From casual wear to formal attire, we have everything you need to express your unique style.' },
      { key: 'hero.buttonText', value: 'Shop Collection' },
      { key: 'hero.backgroundVideo', value: '/videos/clothing-shoot.mp4' },
      { key: 'about.title', value: 'About OnsiShop' },
      { key: 'about.description', value: 'We are passionate about bringing you the finest clothing at affordable prices. Our curated collection features the latest trends and timeless classics, carefully selected to help you look and feel your best.' },
      { key: 'about.backgroundImage', value: '/images/background-image-1756043891412-0nifzaa2fwm.PNG' },
      { key: 'footer.companyName', value: 'OnsiShop' },
      { key: 'footer.description', value: 'Your Premium Fashion Destination' },
      { key: 'contact.email', value: 'contact@onsishop.com' },
      { key: 'contact.phone', value: '+1 (555) 123-4567' },
      { key: 'contact.address', value: '123 Fashion Street, Style City, SC 12345' }
    ];

    let contentCreated = 0;
    for (const contentData of siteContentData) {
      const existingContent = await prisma.siteContent.findUnique({
        where: { key: contentData.key }
      });
      
      if (!existingContent) {
        await prisma.siteContent.create({ data: contentData });
        contentCreated++;
      }
    }
    console.log(`✅ ${siteContentData.length} content items ready (${contentCreated} new, ${siteContentData.length - contentCreated} existing)`);

    console.log('� Database seeded successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${createdCategories.length} categories`);
    console.log(`   - ${createdProducts.length} products`);
    console.log(`   - 2 users (1 admin, 1 demo)`);
    console.log(`   - ${siteContentData.length} content items`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
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
