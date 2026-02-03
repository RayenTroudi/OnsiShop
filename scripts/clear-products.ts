/**
 * Clear all products from Appwrite database
 * WARNING: This will delete ALL products!
 */

import * as dotenv from 'dotenv';
import { Client, Databases, Query } from 'node-appwrite';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const PRODUCTS_COLLECTION_ID = 'products';

async function clearProducts() {
  console.log('🗑️  Starting to delete all products...\n');

  try {
    let hasMore = true;
    let totalDeleted = 0;

    while (hasMore) {
      // Fetch products in batches
      const response = await databases.listDocuments(DATABASE_ID, PRODUCTS_COLLECTION_ID, [
        Query.limit(100)
      ]);

      if (response.documents.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`Found ${response.documents.length} products to delete...`);

      // Delete each product
      for (const doc of response.documents) {
        try {
          await databases.deleteDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, doc.$id);
          totalDeleted++;
          console.log(`✅ Deleted: ${doc.title || doc.name} (${doc.$id})`);
        } catch (error) {
          console.error(`❌ Failed to delete product ${doc.$id}:`, error);
        }
      }

      // If we got less than 100, we're done
      if (response.documents.length < 100) {
        hasMore = false;
      }
    }

    console.log(`\n✅ Successfully deleted ${totalDeleted} products!`);
  } catch (error) {
    console.error('❌ Error clearing products:', error);
    process.exit(1);
  }
}

// Run the script
clearProducts()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
