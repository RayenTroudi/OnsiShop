/**
 * ULTRA-AGGRESSIVE MongoDB Connection Manager for M0 Cluster
 * This ensures only 1 connection exists at any time across the entire application
 */

import { Db, MongoClient } from 'mongodb';

let globalClient: MongoClient | null = null;
let globalDb: Db | null = null;
let globalConnection: { client: MongoClient; db: Db } | null = null;
let connectionPromise: Promise<{ client: MongoClient; db: Db }> | null = null;
let isConnecting = false;
let lastUsed = Date.now();

// Connection timeout - more generous but still aggressive
const CONNECTION_TIMEOUT = 30000; // 30 seconds instead of 15
const FORCE_CLOSE_TIMEOUT = 90000; // 90 seconds before force close
let lastCleanup = 0;

// Force cleanup every 5 seconds
const CLEANUP_INTERVAL = 5000;
const MAX_CONNECTION_DURATION = 10000; // Force close after 10 seconds

/**
 * Get or create the SINGLE global connection
 */
export async function getSingleConnection(): Promise<{ client: MongoClient; db: Db }> {
  const now = Date.now();
  
  // Force cleanup if connection is too old
  if (globalClient && (now - lastCleanup) > MAX_CONNECTION_DURATION) {
    console.log('🔄 Forcing connection cleanup due to age');
    await forceCloseConnection();
  }

  // If we already have a connection promise, wait for it
  if (connectionPromise) {
    try {
      return await connectionPromise;
    } catch (error) {
      connectionPromise = null; // Reset on error
      globalClient = null;
      globalDb = null;
    }
  }

  // If we have a cached connection, test it
  if (globalClient && globalDb) {
    try {
      await globalDb.admin().ping();
      return { client: globalClient, db: globalDb };
    } catch (error) {
      console.warn('⚠️ Cached connection failed, creating new one');
      globalClient = null;
      globalDb = null;
    }
  }

  // Create new connection
  connectionPromise = createFreshConnection();
  
  try {
    const result = await connectionPromise;
    lastCleanup = now;
    
    // Schedule automatic cleanup
    setTimeout(async () => {
      await forceCloseConnection();
    }, CLEANUP_INTERVAL);
    
    return result;
  } finally {
    connectionPromise = null;
  }
}

async function createFreshConnection(): Promise<{ client: MongoClient; db: Db }> {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  console.log('🔌 Creating SINGLE MongoDB connection...');

  const client = new MongoClient(uri, {
    // ULTRA-conservative settings - ONLY 1 connection EVER
    maxPoolSize: 1,
    minPoolSize: 0,
    maxConnecting: 1,
    
    // Aggressive timeouts
    serverSelectionTimeoutMS: 3000,
    socketTimeoutMS: 10000,
    connectTimeoutMS: 3000,
    heartbeatFrequencyMS: 10000,
    maxIdleTimeMS: 500, // Close after 500ms idle
    
    // Minimal settings
    retryWrites: false,
    retryReads: false,
    
    // Network settings
    ignoreUndefined: true,
    compressors: ['zlib'],
    
    // SSL
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
  });

  await client.connect();
  const db = client.db();
  
  // Test the connection
  await db.admin().ping();
  
  console.log('✅ SINGLE MongoDB connection established');
  
  globalClient = client;
  globalDb = db;
  
  return { client, db };
}

/**
 * Force close the global connection
 */
export async function forceCloseConnection(): Promise<void> {
  if (globalClient) {
    try {
      console.log('🧹 Force closing SINGLE MongoDB connection');
      await globalClient.close(true); // Force close
    } catch (error) {
      console.warn('Error force closing connection:', error);
    } finally {
      globalClient = null;
      globalDb = null;
      connectionPromise = null;
      lastCleanup = Date.now();
    }
  }
}

/**
 * Execute a database operation with automatic cleanup
 */
export async function withSingleConnection<T>(
  operation: (db: Db) => Promise<T>
): Promise<T> {
  const { db } = await getSingleConnection();
  
  try {
    const result = await operation(db);
    
    // Schedule cleanup after reasonable delay to allow connection reuse
    setTimeout(async () => {
      if (globalConnection && (Date.now() - lastUsed) > CONNECTION_TIMEOUT) {
        console.log('🧹 Auto-closing SINGLE MongoDB connection after timeout');
        await forceCloseConnection();
      }
    }, CONNECTION_TIMEOUT);
    
    return result;
  } catch (error) {
    // Cleanup on error after delay
    setTimeout(async () => {
      await forceCloseConnection();
    }, 5000); // 5 second delay on error
    
    throw error;
  }
}