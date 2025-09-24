import { Db, MongoClient, ObjectId } from 'mongodb';

// MongoDB connection utility with hot reload support for Next.js development
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    // Test if cached connection is still alive
    try {
      await cachedDb.admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      console.warn('⚠️ Cached MongoDB connection is stale, reconnecting...');
      // Force cleanup on stale connections
      try {
        await cachedClient.close();
      } catch (closeError) {
        // Ignore close errors
      }
      cachedClient = null;
      cachedDb = null;
    }
  }

  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  console.log('🔌 Connecting to MongoDB...');

  const client = new MongoClient(uri, {
    // ULTRA-conservative settings for M0 cluster (max 25 connections)
    maxPoolSize: 1, // ONLY 1 connection maximum
    minPoolSize: 0, // Start with 0 connections
    maxConnecting: 1, // Only 1 connection attempt at a time
    
    // ULTRA-aggressive timeout settings for M0 optimization
    serverSelectionTimeoutMS: 5000, // Reduced to 5 seconds
    socketTimeoutMS: 15000, // Reduced to 15 seconds  
    connectTimeoutMS: 5000, // Reduced to 5 seconds
    heartbeatFrequencyMS: 60000, // Check every 60 seconds (less frequent)
    maxIdleTimeMS: 1000, // Close idle connections after 1 second (VERY aggressive)
    
    // Additional M0 optimizations
    retryWrites: false, // Disable retry writes to reduce connections
    retryReads: false, // Disable retry reads to reduce connections
    
    // Network optimizations
    ignoreUndefined: true,
    compressors: ['zlib'],
    
    // Minimal reliability settings for M0
    w: 1, // Changed from 'majority' to reduce load
    readPreference: 'primary', // Always use primary to avoid extra connections
    readConcern: { level: 'local' }, // Reduced from 'majority'
    
    // Disable monitoring in production for M0
    monitorCommands: false,
    
    // Enhanced SSL settings for better reliability
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
  });

  // Reduced retry logic for M0 cluster
  const maxRetries = 2; // Reduced from 3
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.connect();
      
      const db = client.db(); // Uses default database from connection string
      
      // Test the connection with shorter timeout
      await Promise.race([
        client.db().admin().ping(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection test timeout')), 5000)
        )
      ]);
      
      console.log(`✅ MongoDB connected successfully (attempt ${attempt})`);

      cachedClient = client;
      cachedDb = db;
      
      // Schedule ULTRA-aggressive cleanup for M0
      setTimeout(async () => {
        try {
          await cleanupConnections();
        } catch (error) {
          console.warn('Scheduled cleanup failed:', error);
        }
      }, 10000); // Cleanup after only 10 seconds

      return { client, db };
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, error);
      
      // Special handling for SSL/TLS errors
      if ((error as any).message?.includes('SSL') || (error as any).message?.includes('TLS')) {
        console.error('🔒 SSL/TLS Error detected - this usually indicates connection pool exhaustion');
        console.error('💡 Suggestion: Restart your application to clear the connection pool');
      }
      
      // Close failed client to prevent connection leaks
      try {
        await client.close();
      } catch (closeError) {
        // Ignore close errors
      }
      
      if (attempt < maxRetries) {
        const delay = Math.min(2000 * attempt, 5000); // Faster retry
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // If all retries failed, throw the last error
  throw lastError || new Error('MongoDB connection failed after all retries');
}

// Get database instance
export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

// Close connection (useful for serverless cleanup)
export async function closeConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('🔌 MongoDB connection closed');
  }
}

// Get current connection count (for monitoring)
export async function getConnectionCount(): Promise<number> {
  try {
    if (!cachedClient) return 0;
    const db = await getDatabase();
    const stats = await db.admin().serverStatus();
    return stats.connections?.current || 0;
  } catch (error) {
    console.error('Error getting connection count:', error);
    return -1;
  }
}

// Force cleanup idle connections
export async function cleanupConnections(): Promise<void> {
  try {
    if (cachedClient) {
      // Close and recreate connection to clean up pool
      await cachedClient.close();
      cachedClient = null;
      cachedDb = null;
      console.log('🧹 MongoDB connections cleaned up');
    }
  } catch (error) {
    console.error('Error cleaning up connections:', error);
  }
}

// Health check function
export async function checkMongoDBHealth(): Promise<boolean> {
  try {
    const db = await getDatabase();
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error('MongoDB health check failed:', error);
    return false;
  }
}

// Utility function to generate ObjectId
export function generateObjectId(): string {
  return new ObjectId().toString();
}

// Utility function to convert string to ObjectId
export function toObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

// Utility function to check if string is valid ObjectId
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

// Collection names - centralized for consistency
export const Collections = {
  USERS: 'users',
  CATEGORIES: 'categories', 
  PRODUCTS: 'products',
  CARTS: 'carts',
  CART_ITEMS: 'cart_items',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  SITE_CONTENT: 'site_content',
  NAVIGATION_ITEMS: 'navigation_items',
  SOCIAL_MEDIA: 'social_media',
  MEDIA_ASSETS: 'media_assets',
  RESERVATIONS: 'reservations',
  COMMENTS: 'comments',
  RATINGS: 'ratings',
  TRANSLATIONS: 'translations',
  UPLOADS: 'uploads'
} as const;

// Convenience function for database connection
export const connectDB = connectToDatabase;