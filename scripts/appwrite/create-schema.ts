import * as dotenv from 'dotenv';
import { Client, Databases, IndexType, Permission, Role } from 'node-appwrite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '../../.env.local') });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '692700e000132c961806')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '692701a8001283ad4a42';

// Helper function to wait for attributes to be ready
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function createSchema() {
  console.log('🚀 Starting Appwrite schema creation...\n');

  try {
    // Collection: users
    console.log('Creating collection: users');
    try {
      await databases.createCollection(databaseId, 'users', 'users', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'users', 'accountId', 255, true);
      await databases.createEmailAttribute(databaseId, 'users', 'email', true);
      await databases.createStringAttribute(databaseId, 'users', 'name', 255, true);
      await databases.createEnumAttribute(databaseId, 'users', 'role', ['user', 'admin'], true);
      await databases.createDatetimeAttribute(databaseId, 'users', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'users', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      
      // Wait for attributes to be ready before creating indexes
      
      await sleep(2000);
      
      await databases.createIndex(databaseId, 'users', 'accountId_unique', IndexType.Unique, ['accountId']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'users', 'email_unique', IndexType.Unique, ['email']);

      console.log('✅ Collection "users" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "users" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: categories
    console.log('Creating collection: categories');
    try {
      await databases.createCollection(databaseId, 'categories', 'categories', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'categories', 'name', 255, true);
      await databases.createStringAttribute(databaseId, 'categories', 'handle', 255, true);
      await databases.createStringAttribute(databaseId, 'categories', 'description', 5000, false);
      await databases.createDatetimeAttribute(databaseId, 'categories', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'categories', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'categories', 'handle_unique', IndexType.Unique, ['handle']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'categories', 'createdAt_index', IndexType.Key, ['createdAt'], ['DESC']);

      console.log('✅ Collection "categories" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "categories" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: products
    console.log('Creating collection: products');
    try {
      await databases.createCollection(databaseId, 'products', 'products', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'products', 'title', 500, true);
      await databases.createStringAttribute(databaseId, 'products', 'handle', 255, true);
      await databases.createStringAttribute(databaseId, 'products', 'description', 10000, false);
      await databases.createFloatAttribute(databaseId, 'products', 'price', true);
      await databases.createIntegerAttribute(databaseId, 'products', 'stock', true);
      await databases.createFloatAttribute(databaseId, 'products', 'compareAtPrice', false);
      await databases.createBooleanAttribute(databaseId, 'products', 'availableForSale', true);
      await databases.createStringAttribute(databaseId, 'products', 'categoryId', 255, false);
      await databases.createStringAttribute(databaseId, 'products', 'tags', 10000, false, undefined, true);
      await databases.createStringAttribute(databaseId, 'products', 'images', 10000, false, undefined, true);
      await databases.createStringAttribute(databaseId, 'products', 'variants', 10000, false);
      await databases.createDatetimeAttribute(databaseId, 'products', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'products', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'products', 'handle_unique', IndexType.Unique, ['handle']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'products', 'createdAt_index', IndexType.Key, ['createdAt'], ['DESC']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'products', 'categoryId_index', IndexType.Key, ['categoryId']);

      console.log('✅ Collection "products" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "products" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: carts
    console.log('Creating collection: carts');
    try {
      await databases.createCollection(databaseId, 'carts', 'carts', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'carts', 'userId', 255, false);
      await databases.createStringAttribute(databaseId, 'carts', 'sessionId', 255, false);
      await databases.createDatetimeAttribute(databaseId, 'carts', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'carts', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'carts', 'userId_index', IndexType.Key, ['userId']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'carts', 'sessionId_index', IndexType.Key, ['sessionId']);

      console.log('✅ Collection "carts" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "carts" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: cart_items
    console.log('Creating collection: cart_items');
    try {
      await databases.createCollection(databaseId, 'cart_items', 'cart_items', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'cart_items', 'cartId', 255, true);
      await databases.createStringAttribute(databaseId, 'cart_items', 'productId', 255, true);
      await databases.createIntegerAttribute(databaseId, 'cart_items', 'quantity', true);
      await databases.createStringAttribute(databaseId, 'cart_items', 'variantId', 255, false);
      await databases.createDatetimeAttribute(databaseId, 'cart_items', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'cart_items', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'cart_items', 'cartId_index', IndexType.Key, ['cartId']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'cart_items', 'productId_index', IndexType.Key, ['productId']);

      console.log('✅ Collection "cart_items" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "cart_items" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: orders
    console.log('Creating collection: orders');
    try {
      await databases.createCollection(databaseId, 'orders', 'orders', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'orders', 'userId', 255, true);
      await databases.createStringAttribute(databaseId, 'orders', 'fullName', 255, true);
      await databases.createEmailAttribute(databaseId, 'orders', 'email', true);
      await databases.createStringAttribute(databaseId, 'orders', 'phone', 50, true);
      await databases.createStringAttribute(databaseId, 'orders', 'shippingAddress', 1000, true);
      await databases.createEnumAttribute(databaseId, 'orders', 'status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], true);
      await databases.createFloatAttribute(databaseId, 'orders', 'totalAmount', true);
      await databases.createDatetimeAttribute(databaseId, 'orders', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'orders', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'orders', 'userId_index', IndexType.Key, ['userId']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'orders', 'status_index', IndexType.Key, ['status']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'orders', 'createdAt_index', IndexType.Key, ['createdAt'], ['DESC']);

      console.log('✅ Collection "orders" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "orders" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: order_items
    console.log('Creating collection: order_items');
    try {
      await databases.createCollection(databaseId, 'order_items', 'order_items', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'order_items', 'orderId', 255, true);
      await databases.createStringAttribute(databaseId, 'order_items', 'productId', 255, true);
      await databases.createIntegerAttribute(databaseId, 'order_items', 'quantity', true);
      await databases.createFloatAttribute(databaseId, 'order_items', 'price', true);
      await databases.createDatetimeAttribute(databaseId, 'order_items', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'order_items', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'order_items', 'orderId_index', IndexType.Key, ['orderId']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'order_items', 'productId_index', IndexType.Key, ['productId']);

      console.log('✅ Collection "order_items" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "order_items" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: site_content
    console.log('Creating collection: site_content');
    try {
      await databases.createCollection(databaseId, 'site_content', 'site_content', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'site_content', IndexType.Key, 255, true);
      await databases.createStringAttribute(databaseId, 'site_content', 'value', 50000, true);
      await databases.createDatetimeAttribute(databaseId, 'site_content', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'site_content', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'site_content', 'key_unique', IndexType.Unique, ['key']);

      console.log('✅ Collection "site_content" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "site_content" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: navigation_items
    console.log('Creating collection: navigation_items');
    try {
      await databases.createCollection(databaseId, 'navigation_items', 'navigation_items', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'navigation_items', 'name', 255, true);
      await databases.createStringAttribute(databaseId, 'navigation_items', 'title', 255, true);
      await databases.createStringAttribute(databaseId, 'navigation_items', 'href', 500, true);
      await databases.createIntegerAttribute(databaseId, 'navigation_items', 'order', true);
      await databases.createBooleanAttribute(databaseId, 'navigation_items', 'isPublished', true);
      await databases.createStringAttribute(databaseId, 'navigation_items', 'parentId', 255, false);
      await databases.createDatetimeAttribute(databaseId, 'navigation_items', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'navigation_items', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'navigation_items', 'order_index', IndexType.Key, ['order']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'navigation_items', 'isPublished_index', IndexType.Key, ['isPublished']);

      console.log('✅ Collection "navigation_items" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "navigation_items" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: social_media
    console.log('Creating collection: social_media');
    try {
      await databases.createCollection(databaseId, 'social_media', 'social_media', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'social_media', 'platform', 255, true);
      await databases.createStringAttribute(databaseId, 'social_media', 'platform', 255, true);
      await databases.createStringAttribute(databaseId, 'social_media', 'url', 500, true);
      await databases.createIntegerAttribute(databaseId, 'social_media', 'order', true);
      await databases.createBooleanAttribute(databaseId, 'social_media', 'isPublished', true);
      await databases.createDatetimeAttribute(databaseId, 'social_media', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'social_media', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'social_media', 'order_index', IndexType.Key, ['order']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'social_media', 'isPublished_index', IndexType.Key, ['isPublished']);

      console.log('✅ Collection "social_media" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "social_media" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: media_assets
    console.log('Creating collection: media_assets');
    try {
      await databases.createCollection(databaseId, 'media_assets', 'media_assets', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'media_assets', 'filename', 500, true);
      await databases.createStringAttribute(databaseId, 'media_assets', 'fileId', 255, false);
      await databases.createStringAttribute(databaseId, 'media_assets', 'url', 1000, true);
      await databases.createStringAttribute(databaseId, 'media_assets', 'alt', 500, false);
      await databases.createStringAttribute(databaseId, 'media_assets', 'type', 100, true);
      await databases.createStringAttribute(databaseId, 'media_assets', 'section', 100, false);
      await databases.createDatetimeAttribute(databaseId, 'media_assets', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'media_assets', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'media_assets', 'type_index', IndexType.Key, ['type']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'media_assets', 'section_index', IndexType.Key, ['section']);

      console.log('✅ Collection "media_assets" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "media_assets" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: reservations
    console.log('Creating collection: reservations');
    try {
      await databases.createCollection(databaseId, 'reservations', 'reservations', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'reservations', 'userId', 255, true);
      await databases.createStringAttribute(databaseId, 'reservations', 'fullName', 255, true);
      await databases.createEmailAttribute(databaseId, 'reservations', 'email', true);
      await databases.createStringAttribute(databaseId, 'reservations', 'phone', 50, true);
      await databases.createStringAttribute(databaseId, 'reservations', 'street', 500, true);
      await databases.createStringAttribute(databaseId, 'reservations', 'city', 255, true);
      await databases.createStringAttribute(databaseId, 'reservations', 'zipCode', 50, true);
      await databases.createStringAttribute(databaseId, 'reservations', 'country', 255, true);
      await databases.createStringAttribute(databaseId, 'reservations', 'notes', 2000, false);
      await databases.createStringAttribute(databaseId, 'reservations', 'status', 100, true);
      await databases.createFloatAttribute(databaseId, 'reservations', 'totalAmount', true);
      await databases.createStringAttribute(databaseId, 'reservations', 'items', 50000, true);
      await databases.createDatetimeAttribute(databaseId, 'reservations', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'reservations', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'reservations', 'userId_index', IndexType.Key, ['userId']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'reservations', 'status_index', IndexType.Key, ['status']);

      console.log('✅ Collection "reservations" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "reservations" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: comments
    console.log('Creating collection: comments');
    try {
      await databases.createCollection(databaseId, 'comments', 'comments', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'comments', 'productId', 255, true);
      await databases.createStringAttribute(databaseId, 'comments', 'userId', 255, true);
      await databases.createStringAttribute(databaseId, 'comments', 'text', 5000, true);
      await databases.createDatetimeAttribute(databaseId, 'comments', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'comments', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'comments', 'productId_index', IndexType.Key, ['productId']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'comments', 'userId_index', IndexType.Key, ['userId']);

      console.log('✅ Collection "comments" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "comments" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: ratings
    console.log('Creating collection: ratings');
    try {
      await databases.createCollection(databaseId, 'ratings', 'ratings', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'ratings', 'productId', 255, true);
      await databases.createStringAttribute(databaseId, 'ratings', 'userId', 255, true);
      await databases.createIntegerAttribute(databaseId, 'ratings', 'stars', true);
      await databases.createDatetimeAttribute(databaseId, 'ratings', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'ratings', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'ratings', 'productId_index', IndexType.Key, ['productId']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'ratings', 'userId_index', IndexType.Key, ['userId']);

      console.log('✅ Collection "ratings" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "ratings" already exists\n');
      } else {
        throw error;
      }
    }

    // Collection: uploads
    console.log('Creating collection: uploads');
    try {
      await databases.createCollection(databaseId, 'uploads', 'uploads', [
        Permission.read(Role.any()),
      ]);

      await databases.createStringAttribute(databaseId, 'uploads', 'fileName', 500, true);
      await databases.createStringAttribute(databaseId, 'uploads', 'fileUrl', 1000, true);
      await databases.createIntegerAttribute(databaseId, 'uploads', 'fileSize', true);
      await databases.createStringAttribute(databaseId, 'uploads', 'fileType', 255, true);
      await databases.createStringAttribute(databaseId, 'uploads', 'uploadedBy', 255, true);
      await databases.createEnumAttribute(databaseId, 'uploads', 'uploadType', ['hero-video', 'product-image', 'general-media', 'avatar', 'document'], true);
      await databases.createBooleanAttribute(databaseId, 'uploads', 'isPublic', true);
      await databases.createStringAttribute(databaseId, 'uploads', 'metadata', 10000, false);
      await databases.createDatetimeAttribute(databaseId, 'uploads', 'createdAt', true);
      await databases.createDatetimeAttribute(databaseId, 'uploads', 'updatedAt', true);

      // Wait for attributes to be ready before creating indexes

      await sleep(2000);

      await databases.createIndex(databaseId, 'uploads', 'uploadedBy_index', IndexType.Key, ['uploadedBy']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'uploads', 'uploadType_index', IndexType.Key, ['uploadType']);
      // Wait for attributes to be ready before creating indexes
      await sleep(2000);
      await databases.createIndex(databaseId, 'uploads', 'isPublic_index', IndexType.Key, ['isPublic']);

      console.log('✅ Collection "uploads" created\n');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Collection "uploads" already exists\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 Schema creation completed successfully!');
  } catch (error) {
    console.error('❌ Error creating schema:', error);
    process.exit(1);
  }
}

createSchema();
