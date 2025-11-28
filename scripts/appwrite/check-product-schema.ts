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

async function checkProductSchema() {
  console.log('🔍 Checking products collection schema...\n');

  try {
    const collection = await databases.getCollection(databaseId, 'products');
    
    console.log('📋 Collection:', collection.name);
    console.log('🆔 ID:', collection.$id);
    console.log('\n📊 Attributes:');
    console.log('─'.repeat(60));
    
    collection.attributes.forEach((attr: any) => {
      console.log(`  ${attr.key.padEnd(25)} ${attr.type.padEnd(15)} Required: ${attr.required}`);
    });
    
    console.log('─'.repeat(60));
    console.log('\n✅ Schema check complete!');
    
  } catch (error: any) {
    console.error('❌ Error checking schema:', error);
    console.error('Error details:', error.message || error);
    process.exit(1);
  }
}

checkProductSchema();
