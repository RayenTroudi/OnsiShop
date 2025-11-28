import * as fs from 'fs';
import { Account, Client, Databases, ID, Storage } from 'node-appwrite';
import * as path from 'path';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT || '692700e000132c961806')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const storage = new Storage(client);
const account = new Account(client);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '692701a8001283ad4a42';
const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || '69270279001498a920cf';

interface IdMapping {
  [mongoId: string]: string; // Maps MongoDB _id to Appwrite $id
}

const idMappings: { [collection: string]: IdMapping } = {};

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadJsonFile(filename: string): Promise<any[]> {
  const filePath = path.join(process.cwd(), 'backups', filename);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  return lines.map(line => JSON.parse(line));
}

async function saveIdMappings() {
  const mappingPath = path.join(process.cwd(), 'backups', 'id-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(idMappings, null, 2));
  console.log(`\n✅ ID mappings saved to: ${mappingPath}`);
}

async function migrateUsers() {
  console.log('\n📦 Migrating users...');
  const users = await loadJsonFile('users.json');
  
  if (users.length === 0) {
    console.log('  No users to migrate');
    return;
  }

  idMappings.users = {};
  let successCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      const mongoId = user._id?.$oid || user._id;
      const tempPassword = 'TempPassword123!'; // Users will need to reset

      // Create Appwrite Account
      let accountId: string;
      try {
        const newAccount = await account.create(
          ID.unique(),
          user.email,
          tempPassword,
          user.name || user.email.split('@')[0]
        );
        accountId = newAccount.$id;
      } catch (error: any) {
        if (error.code === 409) {
          // User already exists, skip account creation
          console.log(`  ⚠️  Account already exists for ${user.email}`);
          continue;
        }
        throw error;
      }

      // Create user metadata document
      const userDoc = await databases.createDocument(
        databaseId,
        'users',
        ID.unique(),
        {
          accountId,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          role: user.role || 'user',
          createdAt: user.createdAt?.$date || new Date().toISOString(),
          updatedAt: user.updatedAt?.$date || new Date().toISOString(),
        }
      );

      idMappings.users[mongoId] = userDoc.$id;
      successCount++;
      console.log(`  ✓ Migrated user: ${user.email}`);
      
      await delay(100); // Rate limiting
    } catch (error: any) {
      errorCount++;
      console.error(`  ✗ Error migrating user ${user.email}:`, error.message);
    }
  }

  console.log(`\n  Total: ${users.length}, Success: ${successCount}, Errors: ${errorCount}`);
}

async function migrateCategories() {
  console.log('\n📦 Migrating categories...');
  const categories = await loadJsonFile('categories.json');
  
  if (categories.length === 0) {
    console.log('  No categories to migrate');
    return;
  }

  idMappings.categories = {};
  let successCount = 0;

  for (const category of categories) {
    try {
      const mongoId = category._id?.$oid || category._id;
      
      const doc = await databases.createDocument(
        databaseId,
        'categories',
        ID.unique(),
        {
          name: category.name,
          handle: category.handle,
          description: category.description || '',
          createdAt: category.createdAt?.$date || new Date().toISOString(),
          updatedAt: category.updatedAt?.$date || new Date().toISOString(),
        }
      );

      idMappings.categories[mongoId] = doc.$id;
      successCount++;
      console.log(`  ✓ Migrated category: ${category.name}`);
      
      await delay(100);
    } catch (error: any) {
      console.error(`  ✗ Error migrating category ${category.name}:`, error.message);
    }
  }

  console.log(`\n  Total: ${categories.length}, Success: ${successCount}`);
}

async function migrateProducts() {
  console.log('\n📦 Migrating products...');
  const products = await loadJsonFile('products.json');
  
  if (products.length === 0) {
    console.log('  No products to migrate');
    return;
  }

  idMappings.products = {};
  let successCount = 0;

  for (const product of products) {
    try {
      const mongoId = product._id?.$oid || product._id;
      
      // Map category ID if exists
      let categoryId = product.categoryId;
      if (categoryId && idMappings.categories && idMappings.categories[categoryId]) {
        categoryId = idMappings.categories[categoryId];
      }

      const doc = await databases.createDocument(
        databaseId,
        'products',
        ID.unique(),
        {
          title: product.title || product.name || 'Untitled',
          handle: product.handle,
          description: product.description || '',
          price: parseFloat(product.price) || 0,
          stock: parseInt(product.stock) || 0,
          compareAtPrice: product.compareAtPrice ? parseFloat(product.compareAtPrice) : undefined,
          availableForSale: product.availableForSale !== false,
          categoryId: categoryId || undefined,
          tags: Array.isArray(product.tags) ? product.tags : (product.tags ? [product.tags] : []),
          images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
          variants: typeof product.variants === 'string' ? product.variants : JSON.stringify(product.variants || {}),
          createdAt: product.createdAt?.$date || new Date().toISOString(),
          updatedAt: product.updatedAt?.$date || new Date().toISOString(),
        }
      );

      idMappings.products[mongoId] = doc.$id;
      successCount++;
      console.log(`  ✓ Migrated product: ${product.title || product.name}`);
      
      await delay(100);
    } catch (error: any) {
      console.error(`  ✗ Error migrating product ${product.title || product.name}:`, error.message);
    }
  }

  console.log(`\n  Total: ${products.length}, Success: ${successCount}`);
}

async function migrateOrders() {
  console.log('\n📦 Migrating orders...');
  const orders = await loadJsonFile('orders.json');
  
  if (orders.length === 0) {
    console.log('  No orders to migrate');
    return;
  }

  idMappings.orders = {};
  let successCount = 0;

  for (const order of orders) {
    try {
      const mongoId = order._id?.$oid || order._id;
      
      // Map user ID if exists
      let userId = order.userId;
      if (userId && idMappings.users && idMappings.users[userId]) {
        userId = idMappings.users[userId];
      }

      const doc = await databases.createDocument(
        databaseId,
        'orders',
        ID.unique(),
        {
          userId: userId || '',
          fullName: order.fullName || '',
          email: order.email || '',
          phone: order.phone || '',
          shippingAddress: order.shippingAddress || '',
          status: order.status || 'pending',
          totalAmount: parseFloat(order.totalAmount) || 0,
          createdAt: order.createdAt?.$date || new Date().toISOString(),
          updatedAt: order.updatedAt?.$date || new Date().toISOString(),
        }
      );

      idMappings.orders[mongoId] = doc.$id;
      successCount++;
      console.log(`  ✓ Migrated order: ${mongoId}`);
      
      await delay(100);
    } catch (error: any) {
      console.error(`  ✗ Error migrating order:`, error.message);
    }
  }

  console.log(`\n  Total: ${orders.length}, Success: ${successCount}`);
}

async function migrateOrderItems() {
  console.log('\n📦 Migrating order_items...');
  const orderItems = await loadJsonFile('order_items.json');
  
  if (orderItems.length === 0) {
    console.log('  No order items to migrate');
    return;
  }

  let successCount = 0;

  for (const item of orderItems) {
    try {
      // Map order and product IDs
      let orderId = item.orderId;
      let productId = item.productId;
      
      if (orderId && idMappings.orders && idMappings.orders[orderId]) {
        orderId = idMappings.orders[orderId];
      }
      if (productId && idMappings.products && idMappings.products[productId]) {
        productId = idMappings.products[productId];
      }

      await databases.createDocument(
        databaseId,
        'order_items',
        ID.unique(),
        {
          orderId: orderId || '',
          productId: productId || '',
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || 0,
          createdAt: item.createdAt?.$date || new Date().toISOString(),
          updatedAt: item.updatedAt?.$date || new Date().toISOString(),
        }
      );

      successCount++;
      await delay(100);
    } catch (error: any) {
      console.error(`  ✗ Error migrating order item:`, error.message);
    }
  }

  console.log(`\n  Total: ${orderItems.length}, Success: ${successCount}`);
}

async function migrateSiteContent() {
  console.log('\n📦 Migrating site_content...');
  const siteContent = await loadJsonFile('site_content.json');
  
  if (siteContent.length === 0) {
    console.log('  No site content to migrate');
    return;
  }

  let successCount = 0;

  for (const content of siteContent) {
    try {
      await databases.createDocument(
        databaseId,
        'site_content',
        ID.unique(),
        {
          key: content.key,
          value: content.value || '',
          createdAt: content.createdAt?.$date || new Date().toISOString(),
          updatedAt: content.updatedAt?.$date || new Date().toISOString(),
        }
      );

      successCount++;
      console.log(`  ✓ Migrated content: ${content.key}`);
      await delay(100);
    } catch (error: any) {
      console.error(`  ✗ Error migrating content ${content.key}:`, error.message);
    }
  }

  console.log(`\n  Total: ${siteContent.length}, Success: ${successCount}`);
}

async function migrateMediaAssets() {
  console.log('\n📦 Migrating media_assets...');
  const mediaAssets = await loadJsonFile('media_assets.json');
  
  if (mediaAssets.length === 0) {
    console.log('  No media assets to migrate');
    return;
  }

  let successCount = 0;

  for (const asset of mediaAssets) {
    try {
      await databases.createDocument(
        databaseId,
        'media_assets',
        ID.unique(),
        {
          filename: asset.filename || '',
          fileId: asset.fileId || '',
          url: asset.url || '',
          alt: asset.alt || '',
          type: asset.type || 'image',
          section: asset.section || '',
          createdAt: asset.createdAt?.$date || new Date().toISOString(),
          updatedAt: asset.updatedAt?.$date || new Date().toISOString(),
        }
      );

      successCount++;
      console.log(`  ✓ Migrated media asset: ${asset.filename}`);
      await delay(100);
    } catch (error: any) {
      console.error(`  ✗ Error migrating media asset:`, error.message);
    }
  }

  console.log(`\n  Total: ${mediaAssets.length}, Success: ${successCount}`);
}

async function migrateUploads() {
  console.log('\n📦 Migrating uploads...');
  const uploads = await loadJsonFile('uploads.json');
  
  if (uploads.length === 0) {
    console.log('  No uploads to migrate');
    return;
  }

  let successCount = 0;

  for (const upload of uploads) {
    try {
      // Map uploader ID if exists
      let uploadedBy = upload.uploadedBy;
      if (uploadedBy && idMappings.users && idMappings.users[uploadedBy]) {
        uploadedBy = idMappings.users[uploadedBy];
      }

      const metadata = upload.metadata || {};

      await databases.createDocument(
        databaseId,
        'uploads',
        ID.unique(),
        {
          fileName: upload.fileName || '',
          fileUrl: upload.fileUrl || '',
          fileSize: parseInt(upload.fileSize) || 0,
          fileType: upload.fileType || '',
          uploadedBy: uploadedBy || '',
          uploadType: upload.uploadType || 'general-media',
          isPublic: upload.isPublic !== false,
          metadata: typeof metadata === 'string' ? metadata : JSON.stringify(metadata),
          createdAt: upload.createdAt?.$date || new Date().toISOString(),
          updatedAt: upload.updatedAt?.$date || new Date().toISOString(),
        }
      );

      successCount++;
      await delay(100);
    } catch (error: any) {
      console.error(`  ✗ Error migrating upload:`, error.message);
    }
  }

  console.log(`\n  Total: ${uploads.length}, Success: ${successCount}`);
}

async function migrate() {
  console.log('🚀 Starting data migration from MongoDB to Appwrite...\n');
  console.log('⚠️  Note: Users will be created with temporary passwords (TempPassword123!)');
  console.log('   Users will need to reset their passwords.\n');

  try {
    await migrateUsers();
    await migrateCategories();
    await migrateProducts();
    await migrateOrders();
    await migrateOrderItems();
    await migrateSiteContent();
    await migrateMediaAssets();
    await migrateUploads();

    await saveIdMappings();

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - Users: ${Object.keys(idMappings.users || {}).length}`);
    console.log(`  - Categories: ${Object.keys(idMappings.categories || {}).length}`);
    console.log(`  - Products: ${Object.keys(idMappings.products || {}).length}`);
    console.log(`  - Orders: ${Object.keys(idMappings.orders || {}).length}`);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
