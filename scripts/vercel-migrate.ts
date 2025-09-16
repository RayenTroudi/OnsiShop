#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🚀 Starting Vercel database migration...');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Check if database has data
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    const productCount = await prisma.product.count();
    const siteContentCount = await prisma.siteContent.count();
    const translationCount = await prisma.translation.count();

    console.log(`📊 Current database state:`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Site Content: ${siteContentCount}`);
    console.log(`   - Translations: ${translationCount}`);

    // Only seed if database is empty
    if (userCount === 0) {
      console.log('🌱 Database is empty, starting initial seed...');

      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@onsishop.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'admin'
        }
      });
      console.log('👤 Admin user created');

      // Create basic categories
      const categories = [
        { name: 'Clothing', handle: 'clothing', description: 'Fashion clothing for all occasions' },
        { name: 'Accessories', handle: 'accessories', description: 'Fashion accessories and jewelry' },
        { name: 'Shoes', handle: 'shoes', description: 'Footwear for every style' },
        { name: 'Bags', handle: 'bags', description: 'Bags and purses' }
      ];

      for (const category of categories) {
        await prisma.category.create({ data: category });
      }
      console.log('📂 Categories created');

      // Create basic site content
      const siteContent = [
        { key: 'hero.title', value: 'Welcome to OnsiShop' },
        { key: 'hero.subtitle', value: 'Discover Amazing Fashion' },
        { key: 'hero.description', value: 'Shop the latest trends and styles from our curated collection' },
        { key: 'hero.buttonText', value: 'Shop Now' },
        { key: 'about.title', value: 'Perfect blend of Japanese and Western fashion' },
        { key: 'about.description', value: 'We strive to create pieces that are both unique and timeless' },
        { key: 'footer.companyName', value: 'OnsiShop' },
        { key: 'footer.description', value: 'Your fashion destination' },
        { key: 'contact.email', value: 'contact@onsishop.com' },
        { key: 'contact.phone', value: '+1 (555) 123-4567' },
        { key: 'contact.address', value: '123 Fashion Street, Style City, SC 12345' }
      ];

      for (const content of siteContent) {
        await prisma.siteContent.create({ data: content });
      }
      console.log('📄 Site content created');

      // Create basic translations
      const translations = [
        { key: 'nav.home', language: 'en', text: 'Home' },
        { key: 'nav.home', language: 'fr', text: 'Accueil' },
        { key: 'nav.products', language: 'en', text: 'Products' },
        { key: 'nav.products', language: 'fr', text: 'Produits' },
        { key: 'nav.about', language: 'en', text: 'About' },
        { key: 'nav.about', language: 'fr', text: 'À propos' },
        { key: 'nav.contact', language: 'en', text: 'Contact' },
        { key: 'nav.contact', language: 'fr', text: 'Contact' },
        { key: 'button.addToCart', language: 'en', text: 'Add to Cart' },
        { key: 'button.addToCart', language: 'fr', text: 'Ajouter au panier' }
      ];

      for (const translation of translations) {
        await prisma.translation.create({ data: translation });
      }
      console.log('🌐 Translations created');

      console.log('✅ Database seeded successfully!');
    } else {
      console.log('📦 Database already has data, skipping seed');
    }

    // Verify final state
    const finalUserCount = await prisma.user.count();
    const finalCategoryCount = await prisma.category.count();
    const finalContentCount = await prisma.siteContent.count();
    const finalTranslationCount = await prisma.translation.count();

    console.log(`🎉 Migration completed successfully!`);
    console.log(`📊 Final database state:`);
    console.log(`   - Users: ${finalUserCount}`);
    console.log(`   - Categories: ${finalCategoryCount}`);
    console.log(`   - Content entries: ${finalContentCount}`);
    console.log(`   - Translations: ${finalTranslationCount}`);

  } catch (error) {
    console.error('❌ Database migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default main;