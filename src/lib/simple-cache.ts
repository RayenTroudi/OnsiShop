/**
 * Simple Working Cache Implementation
 * This bypasses complex hooks and uses a direct approach
 */

// Simple in-memory cache with localStorage backup
class SimpleCache {
  private static instance: SimpleCache;
  private memoryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  static getInstance() {
    if (!SimpleCache.instance) {
      SimpleCache.instance = new SimpleCache();
    }
    return SimpleCache.instance;
  }

  set(key: string, data: any, ttlMinutes = 60) {
    const item = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000
    };
    
    // Set in memory
    this.memoryCache.set(key, item);
    
    // Try to set in localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`simple_cache_${key}`, JSON.stringify(item));
        console.log(`✅ Cached: ${key} (memory + localStorage)`);
      }
    } catch (e) {
      console.log(`✅ Cached: ${key} (memory only)`);
    }
  }

  get(key: string) {
    // Try memory first
    let item = this.memoryCache.get(key);
    
    // If not in memory, try localStorage
    if (!item && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`simple_cache_${key}`);
        if (stored) {
          item = JSON.parse(stored);
          // Put back in memory
          if (item) {
            this.memoryCache.set(key, item);
          }
        }
      } catch (e) {
        // Ignore localStorage errors
      }
    }
    
    if (!item) {
      console.log(`❌ Cache miss: ${key}`);
      return null;
    }
    
    // Check if expired
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      console.log(`🗑️ Cache expired: ${key}`);
      this.remove(key);
      return null;
    }
    
    console.log(`✅ Cache hit: ${key}`);
    return item.data;
  }

  remove(key: string) {
    this.memoryCache.delete(key);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`simple_cache_${key}`);
      }
    } catch (e) {
      // Ignore
    }
  }

  clear() {
    this.memoryCache.clear();
    try {
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('simple_cache_')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (e) {
      // Ignore
    }
    console.log('🧹 Cache cleared');
  }

  getStats() {
    let localStorageItems = 0;
    try {
      if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('simple_cache_')) {
            localStorageItems++;
          }
        });
      }
    } catch (e) {
      // Ignore
    }
    
    return {
      memoryItems: this.memoryCache.size,
      localStorageItems,
      totalItems: this.memoryCache.size + localStorageItems
    };
  }
}

// Content cache with automatic API fetching
class ContentCache {
  private static instance: ContentCache;
  private cache = SimpleCache.getInstance();
  private pendingRequest: Promise<any> | null = null;
  
  static getInstance() {
    if (!ContentCache.instance) {
      ContentCache.instance = new ContentCache();
    }
    return ContentCache.instance;
  }

  async getContent(): Promise<any> {
    const CACHE_KEY = 'hero_content';
    
    // Try cache first
    const cached = this.cache.get(CACHE_KEY);
    if (cached) {
      return cached;
    }
    
    // If already fetching, return the pending promise
    if (this.pendingRequest) {
      console.log('🔄 Waiting for pending request...');
      return this.pendingRequest;
    }
    
    // Fetch from API
    console.log('🌐 Fetching from API...');
    this.pendingRequest = this.fetchFromAPI();
    
    try {
      const result = await this.pendingRequest;
      
      // Cache the result
      this.cache.set(CACHE_KEY, result, 60); // 60 minutes
      
      return result;
    } finally {
      this.pendingRequest = null;
    }
  }

  private async fetchFromAPI() {
    const response = await fetch('/api/content');
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'API error');
    }
    
    return result.data || {};
  }

  clearCache() {
    this.cache.remove('hero_content');
  }

  getStats() {
    return this.cache.getStats();
  }
}

// Export singleton instances
export const simpleCache = SimpleCache.getInstance();
export const contentCache = ContentCache.getInstance();