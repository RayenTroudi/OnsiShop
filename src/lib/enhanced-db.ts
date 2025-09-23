import { connectToDatabase } from './mongodb';

// Circuit breaker implementation for MongoDB operations
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private readonly threshold = 5, // Number of failures before opening
    private readonly timeout = 30000, // Time to wait before trying again (30s)
    private readonly monitorWindow = 60000 // Reset failure count window (1min)
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.timeout) {
        throw new Error('Circuit breaker is OPEN - MongoDB operations temporarily disabled');
      }
      // Try to transition to HALF_OPEN
      this.state = 'HALF_OPEN';
      console.log('🔄 Circuit breaker transitioning to HALF_OPEN');
    }

    try {
      const result = await operation();
      
      // Success - reset circuit breaker
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        console.log('✅ Circuit breaker reset to CLOSED');
      }
      
      // Reset failure count if enough time has passed
      if (Date.now() - this.lastFailureTime > this.monitorWindow) {
        this.failures = 0;
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      console.error(`❌ Circuit breaker failure ${this.failures}/${this.threshold}:`, error);
      
      if (this.failures >= this.threshold) {
        this.state = 'OPEN';
        console.error('🔴 Circuit breaker OPENED - too many failures');
      }
      
      throw error;
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.lastFailureTime = 0;
    console.log('🔄 Circuit breaker manually reset');
  }
}

// Global circuit breaker instance
const mongoCircuitBreaker = new CircuitBreaker(3, 20000, 45000); // 3 failures, 20s timeout, 45s window

// Enhanced database operation wrapper with timeout and retry logic
export async function withDatabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'Database Operation',
  timeoutMs: number = 25000 // 25 second timeout
): Promise<T> {
  return mongoCircuitBreaker.execute(async () => {
    console.log(`🔄 Starting ${operationName}...`);
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${operationName} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      // Race between the operation and the timeout
      const result = await Promise.race([
        operation(),
        timeoutPromise
      ]);
      
      console.log(`✅ ${operationName} completed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ ${operationName} failed:`, error);
      
      // If it's a timeout error, try to recover gracefully
      if (error instanceof Error && error.message.includes('timed out')) {
        console.warn(`⏱️ ${operationName} timed out, attempting graceful recovery...`);
        
        // Try to close any hanging connections
        try {
          const { client } = await connectToDatabase();
          // Force close any hanging operations
          await client.db().admin().command({ ping: 1 });
        } catch (recoveryError) {
          console.error('Failed to recover from timeout:', recoveryError);
        }
      }
      
      throw error;
    }
  });
}

// Get circuit breaker status
export function getCircuitBreakerStatus() {
  return mongoCircuitBreaker.getState();
}

// Reset circuit breaker (for admin use)
export function resetCircuitBreaker() {
  mongoCircuitBreaker.reset();
}

// Health check with circuit breaker
export async function performHealthCheck(): Promise<boolean> {
  try {
    return await withDatabaseOperation(async () => {
      const { db } = await connectToDatabase();
      await db.admin().ping();
      return true;
    }, 'MongoDB Health Check', 10000); // 10s timeout for health checks
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

// Enhanced database service methods
export class EnhancedDbService {
  async getAllSiteContent() {
    return withDatabaseOperation(async () => {
      const { db } = await connectToDatabase();
      return await db.collection('site_content')
        .find({})
        .sort({ key: 1 })
        .maxTimeMS(20000) // 20s query timeout
        .toArray();
    }, 'Get All Site Content');
  }

  async getSiteContentByKey(key: string) {
    return withDatabaseOperation(async () => {
      const { db } = await connectToDatabase();
      return await db.collection('site_content')
        .findOne({ key }, { maxTimeMS: 15000 }); // 15s query timeout
    }, `Get Site Content: ${key}`);
  }

  async upsertSiteContent(key: string, value: string) {
    return withDatabaseOperation(async () => {
      const { db } = await connectToDatabase();
      const now = new Date();
      
      return await db.collection('site_content')
        .findOneAndUpdate(
          { key },
          { 
            $set: { 
              key,
              value,
              updatedAt: now
            },
            $setOnInsert: {
              createdAt: now
            }
          },
          { 
            upsert: true, 
            returnDocument: 'after',
            maxTimeMS: 20000 // 20s operation timeout
          }
        );
    }, `Upsert Site Content: ${key}`);
  }

  async getMediaAssets() {
    return withDatabaseOperation(async () => {
      const { db } = await connectToDatabase();
      return await db.collection('media_assets')
        .find({})
        .sort({ createdAt: -1 })
        .maxTimeMS(20000)
        .toArray();
    }, 'Get Media Assets');
  }

  async createMediaAsset(asset: any) {
    return withDatabaseOperation(async () => {
      const { db } = await connectToDatabase();
      const result = await db.collection('media_assets')
        .insertOne({
          ...asset,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      
      return {
        _id: result.insertedId,
        ...asset
      };
    }, 'Create Media Asset');
  }

  async deleteMediaAssets(filter: any) {
    return withDatabaseOperation(async () => {
      const { db } = await connectToDatabase();
      return await db.collection('media_assets')
        .deleteMany(filter);
    }, 'Delete Media Assets');
  }

  async deleteSiteContent(key: string) {
    return withDatabaseOperation(async () => {
      const { db } = await connectToDatabase();
      return await db.collection('site_content')
        .deleteOne({ key });
    }, `Delete Site Content: ${key}`);
  }
}

// Export enhanced service instance
export const enhancedDbService = new EnhancedDbService();