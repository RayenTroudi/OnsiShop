#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkCollections() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment');
    process.exit(1);
  }
  
  console.log('🔗 MongoDB URI found:', process.env.MONGODB_URI.substring(0, 50) + '...');
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    console.log('\n📋 Collections in database:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    console.log(`\n📊 Total collections: ${collections.length}`);
    
    // Check for content in the collections we care about
    const contentCollections = ['sitecontent', 'site_content', 'content'];
    
    for (const collectionName of contentCollections) {
      try {
        const count = await db.collection(collectionName).countDocuments();
        if (count > 0) {
          console.log(`\n📄 ${collectionName}: ${count} documents`);
          const sample = await db.collection(collectionName).findOne();
          console.log(`   Sample document keys: ${Object.keys(sample).join(', ')}`);
        }
      } catch (error) {
        // Collection doesn't exist
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

checkCollections();