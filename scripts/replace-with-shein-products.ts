/**
 * Complete workflow: Clear existing products and import Shein products
 * WARNING: Use for educational/testing purposes only
 */

import * as dotenv from 'dotenv';
import { Client, Databases, ID, Query } from 'node-appwrite';
import * as path from 'path';
import { ShininScraper } from '../src/lib/scraper/shinin-scraper';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const PRODUCTS_COLLECTION_ID = 'products';

interface ScrapedProduct {
  name: string;
  title: string;
  handle: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: Array<{
    size?: string;
    color?: string;
    price: number;
    stock: number;
  }>;
  category: string;
  tags: string[];
  availableForSale: boolean;
  stock: number;
}

async function clearAllProducts() {
  console.log('🗑️  Clearing existing products...\n');

  try {
    let hasMore = true;
    let totalDeleted = 0;

    while (hasMore) {
      const response = await databases.listDocuments(DATABASE_ID, PRODUCTS_COLLECTION_ID, [
        Query.limit(100)
      ]);

      if (response.documents.length === 0) {
        hasMore = false;
        break;
      }

      for (const doc of response.documents) {
        try {
          await databases.deleteDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, doc.$id);
          totalDeleted++;
          console.log(`✅ Deleted: ${doc.title || doc.name}`);
        } catch (error) {
          console.error(`❌ Failed to delete product ${doc.$id}`);
        }
      }

      if (response.documents.length < 100) {
        hasMore = false;
      }
    }

    console.log(`\n✅ Deleted ${totalDeleted} products\n`);
    return totalDeleted;
  } catch (error) {
    console.error('❌ Error clearing products:', error);
    throw error;
  }
}

async function importProduct(product: ScrapedProduct) {
  const doc = await databases.createDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, ID.unique(), {
    name: product.name,
    handle: product.handle,
    title: product.title,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice || null,
    availableForSale: product.availableForSale,
    image: product.images[0] || '',
    images: product.images,
    stock: product.stock,
    categoryId: null,
    tags: product.tags,
    variants: product.variants,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return doc;
}

async function scrapeAndImportProducts(maxPages: number = 2) {
  console.log('🕷️  Scraping Shein products...\n');

  const scraper = new ShininScraper();
  const products = await scraper.scrapeAllProducts(maxPages);

  console.log(`\n💾 Importing ${products.length} products...\n`);

  let imported = 0;
  let failed = 0;

  for (const product of products) {
    try {
      await importProduct(product);
      imported++;
      console.log(`✅ Imported: ${product.name} - ${product.price} DT`);
    } catch (error) {
      failed++;
      console.error(`❌ Failed: ${product.name}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return { imported, failed, total: products.length };
}

async function main() {
  const maxPages = parseInt(process.argv[2]) || 2;

  console.log(`
╔════════════════════════════════════════════════════════════╗
║         SHEIN PRODUCT REPLACEMENT WORKFLOW                ║
╚════════════════════════════════════════════════════════════╝

⚠️  WARNING: This will:
   1. DELETE all existing products
   2. Scrape data from Shein.com
   3. Import scraped products

   Use for educational/testing purposes only!

Configuration:
  - Max Pages to Scrape: ${maxPages}
  - Database: ${DATABASE_ID}
  - Collection: ${PRODUCTS_COLLECTION_ID}

`);

  try {
    // Step 1: Clear existing products
    console.log('STEP 1: Clearing existing products');
    console.log('='.repeat(60) + '\n');
    const deleted = await clearAllProducts();

    // Step 2: Scrape and import new products
    console.log('STEP 2: Scraping and importing Shein products');
    console.log('='.repeat(60) + '\n');
    const { imported, failed, total } = await scrapeAndImportProducts(maxPages);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ WORKFLOW COMPLETED ✨');
    console.log('='.repeat(60));
    console.log(`Deleted:  ${deleted} old products`);
    console.log(`Scraped:  ${total} products from Shein`);
    console.log(`Imported: ${imported} products`);
    console.log(`Failed:   ${failed} products`);
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
