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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function addMissingAttributes() {
  console.log('🔧 Adding missing attributes to users collection...\n');

  try {
    // Add createdAt
    try {
      await databases.createDatetimeAttribute(databaseId, 'users', 'createdAt', true);
      console.log('✅ createdAt attribute added');
      await sleep(2000);
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  createdAt already exists');
      } else {
        throw error;
      }
    }

    // Add updatedAt
    try {
      await databases.createDatetimeAttribute(databaseId, 'users', 'updatedAt', true);
      console.log('✅ updatedAt attribute added');
      await sleep(2000);
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  updatedAt already exists');
      } else {
        throw error;
      }
    }

    console.log('\n✅ All attributes added successfully');
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

addMissingAttributes();
