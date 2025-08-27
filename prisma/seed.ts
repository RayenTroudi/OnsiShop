import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing data first (optional - for development)
    console.log('🧹 Cleaning existing data...');
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.siteContent.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Existing data cleared');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin@gmail.com', 12);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'Administrator',
        role: 'admin',
      },
    });
    console.log('✅ Admin user created (email: admin@gmail.com, password: admin@gmail.com)');

    // Create demo users
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        password: await bcrypt.hash('demo123', 12),
        name: 'Demo User',
        role: 'user',
      },
    });
    console.log('✅ Demo user created (email: demo@example.com, password: demo123)');

    // Create categories with better data structure
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

    const createdCategories = await Promise.all(
      categories.map(category => 
        prisma.category.create({ data: category })
      )
    );
    console.log(`✅ ${createdCategories.length} categories created`);

    // Create products with proper relationships
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

    const createdProducts = await Promise.all(
      products.map(product => 
        prisma.product.create({ data: product })
      )
    );
    console.log(`✅ ${createdProducts.length} products created`);

    console.log(`✅ ${createdProducts.length} products created`);

    // Create default site content
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

    await prisma.siteContent.createMany({
      data: siteContentData
    });
    console.log(`✅ ${siteContentData.length} site content items created`);

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
