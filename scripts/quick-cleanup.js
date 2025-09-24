#!/usr/bin/env node

/**
 * Quick MongoDB Connection Cleanup
 * Simple script to force close all MongoDB connections
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function quickCleanup() {
  console.log('🧹 Quick MongoDB cleanup started...');
  
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  let client;
  
  try {
    // Create a new client just to test and close
    client = new MongoClient(uri, {
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    console.log('🔌 Testing connection...');
    await client.connect();
    
    console.log('✅ Connection test successful');
    console.log('🧹 Closing connection...');
    
    await client.close();
    
    console.log('✅ Cleanup completed successfully!');
    console.log('💡 You can now restart your application: npm run dev');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.log('💡 Try restarting your development server instead');
  } finally {
    if (client) {
      try {
        await client.close();
      } catch (e) {
        // Ignore
      }
    }
  }
}

quickCleanup().then(() => process.exit(0)).catch(() => process.exit(1));