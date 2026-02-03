/**
 * Check the actual attributes of the products collection
 */

import * as dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';
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

async function checkSchema() {
  console.log('📊 Checking Products Collection Schema...\n');

  try {
    const collection = await databases.getCollection(DATABASE_ID, PRODUCTS_COLLECTION_ID);

    console.log('Collection ID:', collection.$id);
    console.log('Collection Name:', collection.name);
    console.log('\nAttributes:\n');

    collection.attributes.forEach((attr: any) => {
      console.log(`- ${attr.key}`);
      console.log(`  Type: ${attr.type}`);
      console.log(`  Required: ${attr.required}`);
      console.log(`  Array: ${attr.array || false}`);
      console.log('');
    });

    console.log('\n✅ Schema check complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSchema();
