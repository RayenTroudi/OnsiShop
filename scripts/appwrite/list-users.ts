import * as dotenv from 'dotenv';
import { Client, Users } from 'node-appwrite';
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

const users = new Users(client);

async function listAppwriteUsers() {
  try {
    const usersList = await users.list();
    console.log('\n📋 Appwrite Users:');
    console.log(JSON.stringify(usersList, null, 2));
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

listAppwriteUsers();
