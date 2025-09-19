/**
 * MongoDB Database Setup Script
 * Creates collections, indexes, and seeds initial data
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');

// Read MongoDB URI from .env.local
function getMongoUri() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      if (line.startsWith('MONGODB_URI=')) {
        return line.substring('MONGODB_URI='.length).replace(/^"(.*)"$/, '$1').trim();
      }
    }
  } catch (error) {
    console.error('❌ Could not read .env.local file:', error.message);
  }
  return null;
}

// Collection definitions
const collections = {
  users: 'users',
  categories: 'categories',
  products: 'products',
  carts: 'carts',
  cart_items: 'cart_items',
  orders: 'orders',
  order_items: 'order_items',
  site_content: 'site_content',
  navigation_items: 'navigation_items',
  social_media: 'social_media',
  media_assets: 'media_assets',
  reservations: 'reservations',
  comments: 'comments',
  ratings: 'ratings',
  translations: 'translations'
};

// Initial data for site content
const initialSiteContent = [
  {
    key: 'hero_title',
    value: 'Welcome to OnsiShop',
    type: 'text',
    section: 'hero',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    key: 'hero_subtitle',
    value: 'Discover amazing products at great prices',
    type: 'text',
    section: 'hero',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    key: 'hero_background_video',
    value: '',
    type: 'video',
    section: 'hero',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    key: 'promotion_title',
    value: 'Special Offers',
    type: 'text',
    section: 'promotion',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    key: 'promotion_description',
    value: 'Check out our latest deals and discounts',
    type: 'text',
    section: 'promotion',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Initial categories
const initialCategories = [
  {
    name: 'Electronics',
    handle: 'electronics',
    description: 'Latest electronic gadgets and devices',
    image: '/images/categories/electronics.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Clothing',
    handle: 'clothing',
    description: 'Fashion and apparel for everyone',
    image: '/images/categories/clothing.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Home & Garden',
    handle: 'home-garden',
    description: 'Everything for your home and garden',
    image: '/images/categories/home-garden.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample products
const initialProducts = [
  {
    title: 'Sample Product 1',
    handle: 'sample-product-1',
    description: 'This is a sample product for testing',
    price: 29.99,
    compareAtPrice: 39.99,
    stock: 100,
    images: ['/images/products/sample1.jpg'],
    availableForSale: true,
    tags: ['sample', 'test'],
    variants: [],
    seo: {
      title: 'Sample Product 1',
      description: 'This is a sample product for testing'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Sample Product 2',
    handle: 'sample-product-2',
    description: 'Another sample product for testing',
    price: 49.99,
    compareAtPrice: 59.99,
    stock: 50,
    images: ['/images/products/sample2.jpg'],
    availableForSale: true,
    tags: ['sample', 'test'],
    variants: [],
    seo: {
      title: 'Sample Product 2',
      description: 'Another sample product for testing'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Navigation items
const initialNavigation = [
  {
    title: 'Home',
    path: '/',
    order: 1,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Products',
    path: '/products',
    order: 2,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Categories',
    path: '/categories',
    order: 3,
    visible: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Social media links
const initialSocialMedia = [
  {
    platform: 'facebook',
    url: 'https://facebook.com/onsishop',
    visible: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    platform: 'twitter',
    url: 'https://twitter.com/onsishop',
    visible: true,
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    platform: 'instagram',
    url: 'https://instagram.com/onsishop',
    visible: true,
    order: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function setupMongoDB() {
  console.log('🚀 Starting MongoDB setup...');
  
  const uri = getMongoUri();
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  console.log('📡 Connecting to MongoDB...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    console.log('✅ Connected to database:', db.databaseName);

    // Create collections with proper indexes
    console.log('📁 Creating collections and indexes...');
    
    // Users collection with indexes
    await db.createCollection(collections.users);
    await db.collection(collections.users).createIndex({ email: 1 }, { unique: true });
    await db.collection(collections.users).createIndex({ createdAt: -1 });
    console.log('✅ Users collection created');

    // Categories collection
    await db.createCollection(collections.categories);
    await db.collection(collections.categories).createIndex({ handle: 1 }, { unique: true });
    await db.collection(collections.categories).createIndex({ name: 1 });
    console.log('✅ Categories collection created');

    // Products collection
    await db.createCollection(collections.products);
    await db.collection(collections.products).createIndex({ handle: 1 }, { unique: true });
    await db.collection(collections.products).createIndex({ title: 'text', description: 'text' });
    await db.collection(collections.products).createIndex({ availableForSale: 1 });
    await db.collection(collections.products).createIndex({ price: 1 });
    await db.collection(collections.products).createIndex({ createdAt: -1 });
    console.log('✅ Products collection created');

    // Carts collection
    await db.createCollection(collections.carts);
    await db.collection(collections.carts).createIndex({ userId: 1 });
    await db.collection(collections.carts).createIndex({ createdAt: -1 });
    console.log('✅ Carts collection created');

    // Cart items collection
    await db.createCollection(collections.cart_items);
    await db.collection(collections.cart_items).createIndex({ cartId: 1 });
    await db.collection(collections.cart_items).createIndex({ productId: 1 });
    await db.collection(collections.cart_items).createIndex({ cartId: 1, productId: 1, variantId: 1 });
    console.log('✅ Cart items collection created');

    // Orders collection
    await db.createCollection(collections.orders);
    await db.collection(collections.orders).createIndex({ userId: 1 });
    await db.collection(collections.orders).createIndex({ status: 1 });
    await db.collection(collections.orders).createIndex({ createdAt: -1 });
    console.log('✅ Orders collection created');

    // Order items collection
    await db.createCollection(collections.order_items);
    await db.collection(collections.order_items).createIndex({ orderId: 1 });
    await db.collection(collections.order_items).createIndex({ productId: 1 });
    console.log('✅ Order items collection created');

    // Site content collection
    await db.createCollection(collections.site_content);
    await db.collection(collections.site_content).createIndex({ key: 1 }, { unique: true });
    await db.collection(collections.site_content).createIndex({ section: 1 });
    console.log('✅ Site content collection created');

    // Navigation items collection
    await db.createCollection(collections.navigation_items);
    await db.collection(collections.navigation_items).createIndex({ order: 1 });
    await db.collection(collections.navigation_items).createIndex({ visible: 1 });
    console.log('✅ Navigation items collection created');

    // Social media collection
    await db.createCollection(collections.social_media);
    await db.collection(collections.social_media).createIndex({ platform: 1 }, { unique: true });
    await db.collection(collections.social_media).createIndex({ order: 1 });
    console.log('✅ Social media collection created');

    // Media assets collection
    await db.createCollection(collections.media_assets);
    await db.collection(collections.media_assets).createIndex({ type: 1 });
    await db.collection(collections.media_assets).createIndex({ section: 1 });
    await db.collection(collections.media_assets).createIndex({ createdAt: -1 });
    console.log('✅ Media assets collection created');

    // Reservations collection
    await db.createCollection(collections.reservations);
    await db.collection(collections.reservations).createIndex({ userId: 1 });
    await db.collection(collections.reservations).createIndex({ email: 1 });
    await db.collection(collections.reservations).createIndex({ createdAt: -1 });
    console.log('✅ Reservations collection created');

    // Comments collection
    await db.createCollection(collections.comments);
    await db.collection(collections.comments).createIndex({ productId: 1 });
    await db.collection(collections.comments).createIndex({ userId: 1 });
    await db.collection(collections.comments).createIndex({ createdAt: -1 });
    console.log('✅ Comments collection created');

    // Ratings collection
    await db.createCollection(collections.ratings);
    await db.collection(collections.ratings).createIndex({ productId: 1 });
    await db.collection(collections.ratings).createIndex({ userId: 1 });
    await db.collection(collections.ratings).createIndex({ productId: 1, userId: 1 }, { unique: true });
    console.log('✅ Ratings collection created');

    // Translations collection
    await db.createCollection(collections.translations);
    await db.collection(collections.translations).createIndex({ key: 1, language: 1 }, { unique: true });
    await db.collection(collections.translations).createIndex({ language: 1 });
    console.log('✅ Translations collection created');

    // Seed initial data
    console.log('🌱 Seeding initial data...');

    // Insert site content
    const existingContent = await db.collection(collections.site_content).countDocuments();
    if (existingContent === 0) {
      await db.collection(collections.site_content).insertMany(initialSiteContent);
      console.log('✅ Site content seeded');
    } else {
      console.log('⚠️  Site content already exists, skipping');
    }

    // Insert categories
    const existingCategories = await db.collection(collections.categories).countDocuments();
    if (existingCategories === 0) {
      await db.collection(collections.categories).insertMany(initialCategories);
      console.log('✅ Categories seeded');
    } else {
      console.log('⚠️  Categories already exist, skipping');
    }

    // Insert products
    const existingProducts = await db.collection(collections.products).countDocuments();
    if (existingProducts === 0) {
      await db.collection(collections.products).insertMany(initialProducts);
      console.log('✅ Products seeded');
    } else {
      console.log('⚠️  Products already exist, skipping');
    }

    // Insert navigation
    const existingNavigation = await db.collection(collections.navigation_items).countDocuments();
    if (existingNavigation === 0) {
      await db.collection(collections.navigation_items).insertMany(initialNavigation);
      console.log('✅ Navigation items seeded');
    } else {
      console.log('⚠️  Navigation items already exist, skipping');
    }

    // Insert social media
    const existingSocial = await db.collection(collections.social_media).countDocuments();
    if (existingSocial === 0) {
      await db.collection(collections.social_media).insertMany(initialSocialMedia);
      console.log('✅ Social media links seeded');
    } else {
      console.log('⚠️  Social media links already exist, skipping');
    }

    console.log('🎉 MongoDB setup completed successfully!');
    
    // Show collections summary
    const allCollections = await db.listCollections().toArray();
    console.log(`\n📊 Database Summary:`);
    console.log(`Database: ${db.databaseName}`);
    console.log(`Collections: ${allCollections.length}`);
    
    for (const collection of allCollections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
    }

  } catch (error) {
    console.error('❌ MongoDB setup failed:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

// Run the setup
setupMongoDB();