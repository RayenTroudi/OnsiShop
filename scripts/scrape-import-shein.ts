/**
 * Scrape Shein products and import them into Appwrite database
 * WARNING: Web scraping may violate Terms of Service - use for educational purposes only
 */

import * as dotenv from 'dotenv';
import { Client, Databases, ID } from 'node-appwrite';
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

async function importProduct(product: ScrapedProduct) {
  try {
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
      categoryId: null, // Can be set later if you create categories
      tags: product.tags,
      variants: product.variants,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return doc;
  } catch (error) {
    console.error(`❌ Failed to import product ${product.name}:`, error);
    throw error;
  }
}

async function scrapeAndImport(maxPages: number = 2) {
  console.log('🕷️  Starting Shein product scraping and import...\n');
  console.log('⚠️  WARNING: This scrapes data from Shein.com');
  console.log('   - May violate their Terms of Service');
  console.log('   - Use for educational/testing purposes only\n');

  const scraper = new ShininScraper();

  try {
    console.log(`📦 Scraping up to ${maxPages} pages of products...\n`);
    const products = await scraper.scrapeAllProducts(maxPages);

    console.log(`\n💾 Importing ${products.length} products into database...\n`);

    let imported = 0;
    let failed = 0;

    for (const product of products) {
      try {
        await importProduct(product);
        imported++;
        console.log(`✅ Imported: ${product.name} - ${product.price} DT`);
      } catch (error) {
        failed++;
        console.error(`❌ Failed to import: ${product.name}`);
      }

      // Add delay to avoid overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Import completed!`);
    console.log(`   Imported: ${imported} products`);
    console.log(`   Failed: ${failed} products`);
    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ Fatal error during scraping/import:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const maxPages = parseInt(process.argv[2]) || 2;

console.log(`
╔════════════════════════════════════════════════════════════╗
║         SHEIN PRODUCT SCRAPER & IMPORTER                  ║
╚════════════════════════════════════════════════════════════╝

Configuration:
  - Max Pages: ${maxPages}
  - Database: ${DATABASE_ID}
  - Collection: ${PRODUCTS_COLLECTION_ID}

`);

// Confirm before running
scrapeAndImport(maxPages)
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
