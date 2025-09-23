/**
 * Browser Cache Manager for OnsiShop
 * Handles localStorage, sessionStorage, and IndexedDB caching
 * with expiration, versioning, and cache invalidation
 */

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  version: string;
}

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds (default: 1 hour)
  version?: string; // Cache version for invalidation
  storage?: 'localStorage' | 'sessionStorage' | 'memory';
  maxSize?: number; // Max items in memory cache
}

class BrowserCacheManager {
  private memoryCache = new Map<string, CacheItem>();
  private readonly defaultConfig: Required<CacheConfig> = {
    ttl: 60 * 60 * 1000, // 1 hour
    version: '1.0.0',
    storage: 'localStorage',
    maxSize: 100
  };

  private isClient = typeof window !== 'undefined';

  constructor() {
    console.log('🚀 BrowserCacheManager constructor - isClient:', this.isClient);
  }

  /**
   * Get cache key with prefix
   */
  private getCacheKey(key: string): string {
    return `onsi_cache_${key}`;
  }

  /**
   * Check if cache item is valid (not expired and correct version)
   */
  private isValidCacheItem<T>(item: CacheItem<T>, version: string): boolean {
    const now = Date.now();
    return item.timestamp + item.expiry > now && item.version === version;
  }

  /**
   * Get storage interface based on config
   */
  private getStorage(storageType: 'localStorage' | 'sessionStorage' | 'memory'): Storage | null {
    if (!this.isClient) return null;
    
    switch (storageType) {
      case 'localStorage':
        return window.localStorage;
      case 'sessionStorage':
        return window.sessionStorage;
      case 'memory':
        return null; // Use memory cache
      default:
        return window.localStorage;
    }
  }

  /**
   * Check if data size is too large for localStorage
   */
  private isDataTooLarge(data: string): boolean {
    // Check if data is larger than 2MB (safe localStorage limit)
    return data.length > 2 * 1024 * 1024;
  }

  /**
   * Clear old entries when quota is exceeded
   */
  private async clearOldEntries(storage: Storage): Promise<void> {
    const entries: Array<{ key: string; timestamp: number }> = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('onsi_cache_')) {
        try {
          const item = storage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            entries.push({ key, timestamp: parsed.timestamp || 0 });
          }
        } catch {
          // Remove invalid entries
          storage.removeItem(key);
        }
      }
    }
    
    // Sort by timestamp (oldest first) and remove oldest half
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = entries.slice(0, Math.ceil(entries.length / 2));
    
    for (const { key } of toRemove) {
      storage.removeItem(key);
    }
    
    console.log(`🧹 Cleared ${toRemove.length} old cache entries`);
  }

  /**
   * Set cache item with expiration and version
   */
  async set<T>(key: string, data: T, config: CacheConfig = {}): Promise<void> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const cacheKey = this.getCacheKey(key);
    
    console.log(`🔧 Cache SET attempt: key="${key}", cacheKey="${cacheKey}", storage="${finalConfig.storage}", isClient=${this.isClient}`);
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiry: finalConfig.ttl,
      version: finalConfig.version
    };

    try {
      if (finalConfig.storage === 'memory') {
        // Memory cache with size limit
        if (this.memoryCache.size >= finalConfig.maxSize) {
          const firstKey = this.memoryCache.keys().next().value;
          this.memoryCache.delete(firstKey);
        }
        this.memoryCache.set(cacheKey, cacheItem);
        console.log(`📦 Cached in memory: ${key}, total items: ${this.memoryCache.size}`);
      } else {
        // Browser storage with quota handling
        const storage = this.getStorage(finalConfig.storage);
        if (storage) {
          const serialized = JSON.stringify(cacheItem);
          
          // Check data size and use appropriate storage
          if (this.isDataTooLarge(serialized)) {
            console.warn(`⚠️ Data too large for ${finalConfig.storage}: ${key} (${serialized.length} bytes), falling back to memory`);
            // Fallback to memory cache for large data
            if (this.memoryCache.size >= finalConfig.maxSize) {
              const firstKey = this.memoryCache.keys().next().value;
              this.memoryCache.delete(firstKey);
            }
            this.memoryCache.set(cacheKey, cacheItem);
            return;
          }
          
          try {
            storage.setItem(cacheKey, serialized);
            console.log(`📦 Cached in ${finalConfig.storage}: ${key}, size: ${serialized.length} bytes`);
          } catch (error: any) {
            if (error.name === 'QuotaExceededError' || error.code === 22) {
              console.warn(`📦 Quota exceeded for ${finalConfig.storage}, clearing old entries and retrying`);
              
              // Clear old entries and retry
              await this.clearOldEntries(storage);
              
              try {
                storage.setItem(cacheKey, serialized);
                console.log(`📦 Cached in ${finalConfig.storage} after cleanup: ${key}`);
              } catch (retryError) {
                console.warn(`⚠️ Still quota exceeded, falling back to memory cache for: ${key}`);
                // Fallback to memory cache
                if (this.memoryCache.size >= finalConfig.maxSize) {
                  const firstKey = this.memoryCache.keys().next().value;
                  this.memoryCache.delete(firstKey);
                }
                this.memoryCache.set(cacheKey, cacheItem);
              }
            } else {
              throw error;
            }
          }
        } else {
          console.warn(`⚠️ Storage not available: ${finalConfig.storage}`);
        }
      }
      
      console.log(`✅ Cache set completed: ${key}`);
    } catch (error) {
      console.error(`❌ Failed to cache ${key}:`, error);
      // Always fallback to memory cache on any error
      try {
        if (this.memoryCache.size >= finalConfig.maxSize) {
          const firstKey = this.memoryCache.keys().next().value;
          this.memoryCache.delete(firstKey);
        }
        this.memoryCache.set(cacheKey, cacheItem);
        console.log(`📦 Fallback to memory cache: ${key}`);
      } catch (memError) {
        console.error(`❌ Memory cache fallback also failed for ${key}:`, memError);
      }
    }
  }

  /**
   * Get cache item if valid, null otherwise
   */
  async get<T>(key: string, config: CacheConfig = {}): Promise<T | null> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const cacheKey = this.getCacheKey(key);

    console.log(`🔍 Cache GET attempt: key="${key}", cacheKey="${cacheKey}", storage="${finalConfig.storage}"`);

    try {
      let cacheItem: CacheItem<T> | null = null;

      // First check memory cache (fastest)
      cacheItem = this.memoryCache.get(cacheKey) as CacheItem<T> || null;
      if (cacheItem) {
        console.log(`🧠 Memory cache hit: ${key}`);
      } else if (finalConfig.storage !== 'memory') {
        // Then check specified storage
        const storage = this.getStorage(finalConfig.storage);
        if (storage) {
          const stored = storage.getItem(cacheKey);
          console.log(`💾 Storage lookup (${finalConfig.storage}): ${stored ? 'found' : 'not found'}, length: ${stored?.length || 0}`);
          if (stored) {
            try {
              cacheItem = JSON.parse(stored);
              // Also cache in memory for faster subsequent access
              if (cacheItem && this.memoryCache.size < finalConfig.maxSize) {
                this.memoryCache.set(cacheKey, cacheItem);
              }
            } catch (parseError) {
              console.warn(`⚠️ Failed to parse cached item ${key}, removing invalid cache`);
              storage.removeItem(cacheKey);
              cacheItem = null;
            }
          }
        } else {
          console.warn(`⚠️ Storage not available for GET: ${finalConfig.storage}`);
        }
      }

      if (cacheItem) {
        const isValid = this.isValidCacheItem(cacheItem, finalConfig.version);
        const now = Date.now();
        const age = now - cacheItem.timestamp;
        console.log(`🕐 Cache item found: age=${age}ms, expiry=${cacheItem.expiry}ms, valid=${isValid}`);
        
        if (isValid) {
          console.log(`✅ Cache hit: ${key}`);
          return cacheItem.data;
        } else {
          // Invalid/expired cache - remove it
          await this.remove(key, config);
          console.log(`🗑️ Cache expired: ${key}`);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to get cache ${key}:`, error);
    }

    console.log(`❌ Cache miss: ${key}`);
    return null;
  }

  /**
   * Remove cache item
   */
  async remove(key: string, config: CacheConfig = {}): Promise<void> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const cacheKey = this.getCacheKey(key);

    try {
      if (finalConfig.storage === 'memory') {
        this.memoryCache.delete(cacheKey);
      } else {
        const storage = this.getStorage(finalConfig.storage);
        if (storage) {
          storage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to remove cache ${key}:`, error);
    }
  }

  /**
   * Clear all cache items with optional prefix
   */
  async clear(prefix?: string): Promise<void> {
    try {
      if (prefix) {
        const targetPrefix = this.getCacheKey(prefix);
        
        // Clear memory cache
        const memoryKeys = Array.from(this.memoryCache.keys());
        for (const key of memoryKeys) {
          if (key.startsWith(targetPrefix)) {
            this.memoryCache.delete(key);
          }
        }
        
        // Clear browser storage
        if (this.isClient) {
          [window.localStorage, window.sessionStorage].forEach(storage => {
            if (!storage) return;
            
            const keysToRemove: string[] = [];
            for (let i = 0; i < storage.length; i++) {
              const key = storage.key(i);
              if (key && key.startsWith(targetPrefix)) {
                keysToRemove.push(key);
              }
            }
            
            keysToRemove.forEach(key => storage.removeItem(key));
          });
        }
      } else {
        // Clear all cache
        this.memoryCache.clear();
        
        if (this.isClient) {
          [window.localStorage, window.sessionStorage].forEach(storage => {
            if (!storage) return;
            
            const keysToRemove: string[] = [];
            for (let i = 0; i < storage.length; i++) {
              const key = storage.key(i);
              if (key && key.startsWith('onsi_cache_')) {
                keysToRemove.push(key);
              }
            }
            
            keysToRemove.forEach(key => storage.removeItem(key));
          });
        }
      }
      
      console.log(`🧹 Cleared cache: ${prefix || 'all'}`);
    } catch (error) {
      console.warn('⚠️ Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    memoryItems: number;
    localStorageItems: number;
    sessionStorageItems: number;
    totalSize: number;
  }> {
    let localStorageItems = 0;
    let sessionStorageItems = 0;
    let totalSize = 0;

    console.log(`📊 Getting cache stats, isClient: ${this.isClient}`);

    if (this.isClient) {
      try {
        [
          { storage: window.localStorage, name: 'localStorage', counter: () => localStorageItems++ },
          { storage: window.sessionStorage, name: 'sessionStorage', counter: () => sessionStorageItems++ }
        ].forEach(({ storage, name, counter }) => {
          if (!storage) {
            console.warn(`⚠️ ${name} not available`);
            return;
          }
          
          let itemCount = 0;
          for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && key.startsWith('onsi_cache_')) {
              counter();
              itemCount++;
              const item = storage.getItem(key);
              totalSize += key.length + (item?.length || 0);
            }
          }
          console.log(`📋 ${name}: ${itemCount} cache items`);
        });
      } catch (error) {
        console.error('❌ Error getting storage stats:', error);
      }
    } else {
      console.log('⚠️ Not client-side, skipping storage stats');
    }

    const result = {
      memoryItems: this.memoryCache.size,
      localStorageItems,
      sessionStorageItems,
      totalSize
    };

    console.log('📊 Final stats:', result);
    return result;
  }
}

// Lazy singleton instance - only create on client
let cacheManagerInstance: BrowserCacheManager | null = null;

export const cacheManager = {
  get instance() {
    if (typeof window === 'undefined') {
      // Return a no-op cache for server-side
      return {
        get: async () => null,
        set: async () => {},
        remove: async () => {},
        clear: async () => {},
        getStats: () => ({
          memoryItems: 0,
          localStorageItems: 0,
          sessionStorageItems: 0,
          totalSize: 0
        })
      };
    }
    
    if (!cacheManagerInstance) {
      console.log('🚀 Creating BrowserCacheManager instance on client');
      cacheManagerInstance = new BrowserCacheManager();
    }
    return cacheManagerInstance;
  },
  
  async get<T>(key: string, config?: CacheConfig): Promise<T | null> {
    return this.instance.get<T>(key, config);
  },
  
  async set<T>(key: string, data: T, config?: CacheConfig): Promise<void> {
    return this.instance.set(key, data, config);
  },
  
  async remove(key: string, config?: CacheConfig): Promise<void> {
    return this.instance.remove(key, config);
  },
  
  async clear(prefix?: string): Promise<void> {
    return this.instance.clear(prefix);
  },
  
  getStats() {
    return this.instance.getStats();
  }
};

// Specific cache keys for the app
export const CACHE_KEYS = {
  CONTENT: 'content_data',
  HERO_VIDEO: 'hero_video_url',
  HERO_IMAGE: 'hero_background_image',
  CATEGORIES: 'categories_data',
  PRODUCTS: 'products_data',
  TRANSLATIONS: 'translations_data'
} as const;

// Cache configurations for different data types
export const CACHE_CONFIGS = {
  CONTENT: { ttl: 60 * 60 * 1000, version: '1.0.0', storage: 'localStorage' as const }, // 1 hour
  MEDIA: { ttl: 24 * 60 * 60 * 1000, version: '1.0.0', storage: 'localStorage' as const }, // 24 hours
  TRANSLATIONS: { ttl: 24 * 60 * 60 * 1000, version: '1.0.0', storage: 'localStorage' as const }, // 24 hours
  SESSION: { ttl: 30 * 60 * 1000, version: '1.0.0', storage: 'sessionStorage' as const }, // 30 minutes
  TEMPORARY: { ttl: 5 * 60 * 1000, version: '1.0.0', storage: 'memory' as const } // 5 minutes
} as const;