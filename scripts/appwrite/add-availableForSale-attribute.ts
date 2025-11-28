import * as dotenv from 'dotenv';
import { Client, Databases } from 'node-appwrite';
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

async function addAvailableForSaleAttribute() {
  console.log('🚀 Adding availableForSale attribute to products collection...\n');

  try {
    // Add the availableForSale boolean attribute
    // Make it optional (false) with a default value of true
    await databases.createBooleanAttribute(
      databaseId, 
      'products', 
      'availableForSale', 
      false, // not required (optional)
      true   // default value
    );

    console.log('✅ Successfully added availableForSale attribute to products collection');
    console.log('   - Type: Boolean');
    console.log('   - Required: No (optional)');
    console.log('   - Default: true');
    console.log('\n✨ All existing products will have availableForSale set to true by default.');
    
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️  Attribute "availableForSale" already exists in products collection');
    } else {
      console.error('❌ Error adding attribute:', error);
      console.error('Error details:', error.message || error);
      process.exit(1);
    }
  }
}

addAvailableForSaleAttribute();
