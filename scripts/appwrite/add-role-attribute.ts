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

async function addRoleAttribute() {
  console.log('🔧 Adding role attribute to users collection...\n');

  try {
    await databases.createEnumAttribute(
      databaseId,
      'users',
      'role',
      ['user', 'admin'],
      true
    );
    console.log('✅ Role attribute added successfully');
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️  Role attribute already exists');
    } else {
      console.error('❌ Error:', error.message);
      throw error;
    }
  }
}

addRoleAttribute();
