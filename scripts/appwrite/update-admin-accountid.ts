import * as dotenv from 'dotenv';
import { Client, Databases, Query } from 'node-appwrite';
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

async function updateAdminAccountId() {
  try {
    const users = await databases.listDocuments(
      databaseId,
      'users',
      [Query.equal('email', 'admin@onsishop.com')]
    );

    if (users.total > 0) {
      const user = users.documents[0];
      await databases.updateDocument(
        databaseId,
        'users',
        user.$id,
        {
          accountId: '6929b586003751ef22c0'
        }
      );
      console.log('✅ Admin user account ID updated successfully');
      console.log('\n📋 Admin User Details:');
      console.log('  Email: admin@onsishop.com');
      console.log('  Password: Admin123!@#');
      console.log('  Account ID: 6929b586003751ef22c0');
      console.log('  User ID:', user.$id);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

updateAdminAccountId();
