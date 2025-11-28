import * as dotenv from 'dotenv';
import { Account, Client, Databases, ID, Query } from 'node-appwrite';
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

const account = new Account(client);
const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '692701a8001283ad4a42';

async function createAdminUser() {
  console.log('🔐 Creating Admin User...\n');

  const adminEmail = 'admin@onsishop.com';
  const adminPassword = 'Admin123!@#'; // Change this to a secure password
  const adminName = 'Admin User';

  try {
    // Step 1: Create Appwrite Account
    console.log('📝 Creating Appwrite account...');
    let appwriteAccount;
    
    try {
      appwriteAccount = await account.create(
        ID.unique(),
        adminEmail,
        adminPassword,
        adminName
      );
      console.log('✅ Appwrite account created:', appwriteAccount.$id);
    } catch (error: any) {
      if (error.code === 409) {
        console.log('⚠️  Account already exists, attempting to retrieve...');
        // If account exists, we need to get it through a session
        // For now, we'll skip account creation and just create the user document
        appwriteAccount = { $id: 'existing-account' };
      } else {
        throw error;
      }
    }

    // Step 2: Create User Document in Database
    console.log('\n📦 Creating user document in database...');
    
    // First, check if user already exists
    const existingUsers = await databases.listDocuments(
      databaseId,
      'users',
      [
        Query.equal('email', adminEmail)
      ]
    );

    if (existingUsers.total > 0) {
      console.log('⚠️  User document already exists');
      const user = existingUsers.documents[0];
      console.log('\n📋 Existing Admin User Details:');
      console.log('  Email:', adminEmail);
      console.log('  Name:', (user as any).name);
      console.log('  Role:', (user as any).role);
      console.log('  Account ID:', (user as any).accountId);
      console.log('  User ID:', user.$id);
      return;
    }

    // Create new user document
    const userDoc = await databases.createDocument(
      databaseId,
      'users',
      ID.unique(),
      {
        accountId: appwriteAccount.$id,
        email: adminEmail,
        name: adminName,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    console.log('✅ User document created:', userDoc.$id);

    console.log('\n🎉 Admin user created successfully!\n');
    console.log('📋 Admin User Credentials:');
    console.log('  Email:', adminEmail);
    console.log('  Password:', adminPassword);
    console.log('  Role: admin');
    console.log('  Account ID:', appwriteAccount.$id);
    console.log('  User ID:', userDoc.$id);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n🔗 You can now login at: http://localhost:3000/login');

  } catch (error: any) {
    console.error('\n❌ Error creating admin user:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

createAdminUser();
