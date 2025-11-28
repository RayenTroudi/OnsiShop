// This file is deprecated - Appwrite handles all database operations
// Kept for backwards compatibility

// Circuit breaker implementation (deprecated - Appwrite manages this)
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

// Global circuit breaker instance (deprecated)
const mongoCircuitBreaker = new CircuitBreaker(3, 20000, 45000);

// Enhanced database operation wrapper (deprecated - use Appwrite)
export async function withDatabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'Database Operation',
  timeoutMs: number = 25000
): Promise<T> {
  // Just execute the operation - Appwrite handles timeouts and retries
  return operation();
}

// Get circuit breaker status (deprecated)
export function getCircuitBreakerStatus() {
  return {
    state: 'CLOSED',
    failures: 0,
    lastFailureTime: 0
  };
}

// Reset circuit breaker (deprecated)
export function resetCircuitBreaker() {
  // No-op - Appwrite manages this
}

// Health check (deprecated)
export async function performHealthCheck(): Promise<boolean> {
  try {
    // Appwrite health is managed automatically
    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

// Enhanced database service methods (deprecated - use @/lib/appwrite/database instead)
export class EnhancedDbService {
  async getAllSiteContent() {
    // Deprecated - use dbService from @/lib/appwrite/database
    throw new Error('EnhancedDbService is deprecated - use @/lib/appwrite/database instead');
  }

  async getSiteContentByKey(key: string) {
    // Deprecated - use dbService from @/lib/appwrite/database
    throw new Error('EnhancedDbService is deprecated - use @/lib/appwrite/database instead');
  }

  async upsertSiteContent(key: string, value: string) {
    // Deprecated - use dbService from @/lib/appwrite/database
    throw new Error('EnhancedDbService is deprecated - use @/lib/appwrite/database instead');
  }

  async getMediaAssets(filters?: any) {
    // Deprecated - use dbService from @/lib/appwrite/database
    throw new Error('EnhancedDbService is deprecated - use @/lib/appwrite/database instead');
  }

  async createMediaAsset(data: any) {
    // Deprecated - use dbService from @/lib/appwrite/database
    throw new Error('EnhancedDbService is deprecated - use @/lib/appwrite/database instead');
  }

  async deleteMediaAssetById(id: string) {
    // Deprecated - use dbService from @/lib/appwrite/database
    throw new Error('EnhancedDbService is deprecated - use @/lib/appwrite/database instead');
  }

  async updateMediaAsset(id: string, updates: any) {
    // Deprecated - use dbService from @/lib/appwrite/database
    throw new Error('EnhancedDbService is deprecated - use @/lib/appwrite/database instead');
  }

  deleteSiteContent(key: string) {
    // Deprecated - use dbService from @/lib/appwrite/database
    throw new Error('EnhancedDbService is deprecated - use @/lib/appwrite/database instead');
  }
}

// Export enhanced service instance (deprecated)
export const enhancedDbService = new EnhancedDbService();