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
    // Optimized connection options for better timeout handling
    maxPoolSize: 15, // Maintain up to 15 socket connections
    minPoolSize: 3, // Minimum number of connections in the pool
    maxConnecting: 5, // Maximum number of connections being created at once
    
    // Aggressive timeout settings to prevent hanging
    serverSelectionTimeoutMS: 15000, // Keep trying to send operations for 15 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    connectTimeoutMS: 15000, // Give up initial connection after 15 seconds
    heartbeatFrequencyMS: 5000, // Check server every 5 seconds (more frequent)
    maxIdleTimeMS: 20000, // Close connections after 20 seconds of inactivity (faster cleanup)
    
    // Retry and error handling
    retryWrites: true, // Retry failed writes
    retryReads: true, // Retry failed reads
    
    // Additional performance settings
    ignoreUndefined: true, // Ignore undefined values
    
    // Compression for better network performance
    compressors: ['zlib'],
    
    // Additional reliability settings
    w: 'majority', // Write concern - wait for majority of replica set
    readPreference: 'primaryPreferred', // Prefer primary, but allow secondary reads
    readConcern: { level: 'majority' }, // Read concern for consistency
    
    // Connection monitoring
    monitorCommands: process.env.NODE_ENV === 'development',
    
    // SSL/TLS settings for production
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
  });

  // Retry logic for connection
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.connect();
      
      const db = client.db(); // Uses default database from connection string
      
      // Test the connection
      await client.db().admin().ping();
      console.log(`✅ MongoDB connected successfully (attempt ${attempt})`);

      cachedClient = client;
      cachedDb = db;

      return { client, db };
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ MongoDB connection attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
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