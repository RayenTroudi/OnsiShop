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

async function addImagesAttribute() {
  console.log('🚀 Adding images attribute to products collection...\n');

  try {
    // Add the images string array attribute
    await databases.createStringAttribute(
      databaseId, 
      'products', 
      'images', 
      10000,    // max length
      false,    // not required (optional)
      undefined, // no default value
      true      // array
    );

    console.log('✅ Successfully added images attribute to products collection');
    console.log('   - Type: String Array');
    console.log('   - Required: No (optional)');
    console.log('   - Max Length: 10000');
    console.log('\n✨ Products can now store multiple image URLs.');
    
  } catch (error: any) {
    if (error.code === 409) {
      console.log('⚠️  Attribute "images" already exists in products collection');
    } else {
      console.error('❌ Error adding attribute:', error);
      console.error('Error details:', error.message || error);
      process.exit(1);
    }
  }
}

addImagesAttribute();
