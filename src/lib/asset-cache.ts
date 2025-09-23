/**
 * Asset Caching Utilities for OnsiShop
 * Handles video, image, and media file caching with progressive loading,
 * cache headers, versioning, and intelligent fallback strategies
 */

export interface AssetCacheConfig {
  maxAge?: number; // Cache duration in milliseconds
  staleWhileRevalidate?: boolean; // Allow serving stale content while updating
  version?: string; // Asset version for cache busting
  quality?: number; // Image quality (1-100)
  format?: 'webp' | 'jpg' | 'png' | 'auto'; // Preferred format
  fallbackUrl?: string; // Fallback asset URL
}

export interface CachedAsset {
  url: string;
  blob?: Blob;
  objectUrl?: string;
  timestamp: number;
  version: string;
  size: number;
  type: string;
  headers: Record<string, string>;
}

export interface AssetLoadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class AssetCacheManager {
  private cache = new Map<string, CachedAsset>();
  private loadingPromises = new Map<string, Promise<CachedAsset>>();
  private readonly DB_NAME = 'OnsiAssetCache';
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeDB();
    }
  }

  /**
   * Initialize IndexedDB for large asset storage
   */
  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.warn('Failed to initialize IndexedDB for asset cache');
        resolve(); // Continue without IndexedDB
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Asset cache IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('assets')) {
          const store = db.createObjectStore('assets', { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('version', 'version');
        }
      };
    });
  }

  /**
   * Generate cache key for asset
   */
  private getCacheKey(url: string, config?: AssetCacheConfig): string {
    const params = new URLSearchParams();
    if (config?.quality) params.set('q', config.quality.toString());
    if (config?.format && config.format !== 'auto') params.set('f', config.format);
    if (config?.version) params.set('v', config.version);
    
    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  /**
   * Check if asset is in cache and valid
   */
  private async getCachedAsset(cacheKey: string, config?: AssetCacheConfig): Promise<CachedAsset | null> {
    // Check memory cache first
    const memoryAsset = this.cache.get(cacheKey);
    if (memoryAsset && this.isAssetValid(memoryAsset, config)) {
      return memoryAsset;
    }

    // Check IndexedDB cache
    if (this.db) {
      try {
        const transaction = this.db.transaction(['assets'], 'readonly');
        const store = transaction.objectStore('assets');
        const request = store.get(cacheKey);

        return new Promise((resolve) => {
          request.onsuccess = () => {
            const asset = request.result;
            if (asset && this.isAssetValid(asset, config)) {
              // Load blob back into memory cache
              this.cache.set(cacheKey, asset);
              resolve(asset);
            } else {
              resolve(null);
            }
          };
          request.onerror = () => resolve(null);
        });
      } catch (error) {
        console.warn('Error reading from IndexedDB cache:', error);
      }
    }

    return null;
  }

  /**
   * Store asset in cache (both memory and IndexedDB)
   */
  private async storeAsset(cacheKey: string, asset: CachedAsset): Promise<void> {
    // Store in memory cache
    this.cache.set(cacheKey, asset);

    // Store in IndexedDB for persistence
    if (this.db) {
      try {
        const transaction = this.db.transaction(['assets'], 'readwrite');
        const store = transaction.objectStore('assets');
        await new Promise<void>((resolve, reject) => {
          const request = store.put({ ...asset, url: cacheKey });
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.warn('Error storing asset in IndexedDB:', error);
      }
    }
  }

  /**
   * Check if cached asset is still valid
   */
  private isAssetValid(asset: CachedAsset, config?: AssetCacheConfig): boolean {
    const maxAge = config?.maxAge || 24 * 60 * 60 * 1000; // 24 hours default
    const age = Date.now() - asset.timestamp;
    
    // Check version match if specified
    if (config?.version && asset.version !== config.version) {
      return false;
    }
    
    // Check age
    return age < maxAge;
  }

  /**
   * Load asset with progressive loading and caching
   */
  async loadAsset(
    url: string, 
    config?: AssetCacheConfig,
    onProgress?: (progress: AssetLoadProgress) => void
  ): Promise<CachedAsset> {
    const cacheKey = this.getCacheKey(url, config);

    // Check if already loading
    const existingPromise = this.loadingPromises.get(cacheKey);
    if (existingPromise) {
      return existingPromise;
    }

    // Check cache first
    const cachedAsset = await this.getCachedAsset(cacheKey, config);
    if (cachedAsset) {
      console.log(`📦 Serving asset from cache: ${url}`);
      return cachedAsset;
    }

    // Load from network with progress tracking
    const loadPromise = this.fetchAssetWithProgress(url, config, onProgress);
    this.loadingPromises.set(cacheKey, loadPromise);

    try {
      const asset = await loadPromise;
      await this.storeAsset(cacheKey, asset);
      return asset;
    } finally {
      this.loadingPromises.delete(cacheKey);
    }
  }

  /**
   * Fetch asset from network with progress tracking
   */
  private async fetchAssetWithProgress(
    url: string,
    config?: AssetCacheConfig,
    onProgress?: (progress: AssetLoadProgress) => void
  ): Promise<CachedAsset> {
    console.log(`🌐 Fetching asset from network: ${url}`);

    const response = await fetch(url, {
      headers: {
        'Cache-Control': config?.staleWhileRevalidate ? 'max-age=3600' : 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to load asset: ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const chunks: Uint8Array[] = [];
    let loaded = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;

        if (onProgress && total > 0) {
          onProgress({
            loaded,
            total,
            percentage: Math.round((loaded / total) * 100)
          });
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Create blob from chunks
    const blob = new Blob(chunks, { 
      type: response.headers.get('content-type') || 'application/octet-stream' 
    });

    const objectUrl = URL.createObjectURL(blob);

    const asset: CachedAsset = {
      url,
      blob,
      objectUrl,
      timestamp: Date.now(),
      version: config?.version || '1.0.0',
      size: blob.size,
      type: blob.type,
      headers: Object.fromEntries(response.headers.entries())
    };

    return asset;
  }

  /**
   * Preload assets for better performance
   */
  async preloadAssets(urls: string[], config?: AssetCacheConfig): Promise<void> {
    console.log(`📋 Preloading ${urls.length} assets`);
    
    const promises = urls.map(url => 
      this.loadAsset(url, config).catch(error => {
        console.warn(`Failed to preload asset ${url}:`, error);
        return null;
      })
    );

    await Promise.allSettled(promises);
    console.log(`✅ Preloading completed`);
  }

  /**
   * Clear expired assets from cache
   */
  async clearExpiredAssets(): Promise<void> {
    const now = Date.now();
    
    // Clear from memory cache
    const entries = Array.from(this.cache.entries());
    for (const [key, asset] of entries) {
      if (!this.isAssetValid(asset)) {
        if (asset.objectUrl) {
          URL.revokeObjectURL(asset.objectUrl);
        }
        this.cache.delete(key);
      }
    }

    // Clear from IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction(['assets'], 'readwrite');
        const store = transaction.objectStore('assets');
        const index = store.index('timestamp');
        
        // Get all assets older than 7 days
        const maxAge = 7 * 24 * 60 * 60 * 1000;
        const cutoff = now - maxAge;
        
        const request = index.openCursor(IDBKeyRange.upperBound(cutoff));
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      } catch (error) {
        console.warn('Error clearing expired assets from IndexedDB:', error);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    memoryAssets: number;
    memorySize: number;
    totalAssets: number;
  } {
    let memorySize = 0;
    const assets = Array.from(this.cache.values());
    for (const asset of assets) {
      memorySize += asset.size;
    }

    return {
      memoryAssets: this.cache.size,
      memorySize,
      totalAssets: this.cache.size // Will be updated to include IndexedDB count
    };
  }

  /**
   * Clear all cached assets
   */
  async clearAllAssets(): Promise<void> {
    // Clear memory cache and revoke object URLs
    const assets = Array.from(this.cache.values());
    for (const asset of assets) {
      if (asset.objectUrl) {
        URL.revokeObjectURL(asset.objectUrl);
      }
    }
    this.cache.clear();

    // Clear IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction(['assets'], 'readwrite');
        const store = transaction.objectStore('assets');
        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        console.warn('Error clearing IndexedDB:', error);
      }
    }

    console.log('🧹 All cached assets cleared');
  }

  /**
   * Get all cached entries for management dashboard
   */
  async getAllEntries(): Promise<Array<{
    key: string;
    url: string;
    data?: ArrayBuffer;
    timestamp: number;
    version: string;
    size: number;
    type: string;
  }>> {
    const entries: Array<{
      key: string;
      url: string;
      data?: ArrayBuffer;
      timestamp: number;
      version: string;
      size: number;
      type: string;
    }> = [];

    // Add memory cache entries
    const cacheKeys = Array.from(this.cache.keys());
    for (const key of cacheKeys) {
      const asset = this.cache.get(key);
      if (asset) {
        entries.push({
          key,
          url: asset.url,
          data: asset.blob ? await asset.blob.arrayBuffer() : undefined,
          timestamp: asset.timestamp,
          version: asset.version,
          size: asset.size,
          type: asset.type
        });
      }
    }

    // Add IndexedDB entries
    if (this.db) {
      try {
        const transaction = this.db.transaction(['assets'], 'readonly');
        const store = transaction.objectStore('assets');
        const request = store.getAll();

        const dbAssets = await new Promise<any[]>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        });

        for (const asset of dbAssets) {
          // Avoid duplicates from memory cache
          if (!this.cache.has(asset.url)) {
            entries.push({
              key: asset.url,
              url: asset.url,
              data: asset.blob ? await asset.blob.arrayBuffer() : undefined,
              timestamp: asset.timestamp,
              version: asset.version,
              size: asset.size,
              type: asset.type
            });
          }
        }
      } catch (error) {
        console.warn('Error reading all entries from IndexedDB:', error);
      }
    }

    return entries;
  }

  /**
   * Clear cache (alias for clearAllAssets for dashboard compatibility)
   */
  async clearCache(): Promise<void> {
    await this.clearAllAssets();
  }

  /**
   * Clean up old entries based on date
   */
  async cleanupOldEntries(cutoffDate: Date): Promise<void> {
    const cutoffTimestamp = cutoffDate.getTime();

    // Clear from memory cache
    const cacheKeys = Array.from(this.cache.keys());
    for (const key of cacheKeys) {
      const asset = this.cache.get(key);
      if (asset && asset.timestamp < cutoffTimestamp) {
        if (asset.objectUrl) {
          URL.revokeObjectURL(asset.objectUrl);
        }
        this.cache.delete(key);
      }
    }

    // Clear from IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction(['assets'], 'readwrite');
        const store = transaction.objectStore('assets');
        const index = store.index('timestamp');
        
        const request = index.openCursor(IDBKeyRange.upperBound(cutoffTimestamp));
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          }
        };
      } catch (error) {
        console.warn('Error cleaning up old entries from IndexedDB:', error);
      }
    }

    console.log(`🧹 Cleaned up assets older than ${cutoffDate.toLocaleDateString()}`);
  }

  /**
   * Get asset from cache (alias for loadAsset for dashboard compatibility)
   */
  async getAsset(url: string, mimeType?: string, config?: AssetCacheConfig): Promise<CachedAsset> {
    return await this.loadAsset(url, config);
  }
}

// Singleton instance
export const assetCache = new AssetCacheManager();

/**
 * Utility functions for common asset operations
 */

export async function cacheVideo(
  url: string,
  config?: AssetCacheConfig,
  onProgress?: (progress: AssetLoadProgress) => void
): Promise<string> {
  const asset = await assetCache.loadAsset(url, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for videos
    staleWhileRevalidate: true,
    ...config
  }, onProgress);
  
  return asset.objectUrl || asset.url;
}

export async function cacheImage(
  url: string,
  config?: AssetCacheConfig,
  onProgress?: (progress: AssetLoadProgress) => void
): Promise<string> {
  const asset = await assetCache.loadAsset(url, {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours for images
    staleWhileRevalidate: true,
    format: 'auto',
    ...config
  }, onProgress);
  
  return asset.objectUrl || asset.url;
}

export async function preloadHeroAssets(heroData: Record<string, any>): Promise<void> {
  const urls: string[] = [];
  
  // Collect video URLs
  if (heroData.heroVideoUrl) {
    urls.push(heroData.heroVideoUrl);
  }
  
  // Collect image URLs
  if (heroData.heroBackgroundImage) {
    urls.push(heroData.heroBackgroundImage);
  }
  
  if (heroData.promotionImage) {
    urls.push(heroData.promotionImage);
  }

  if (urls.length > 0) {
    await assetCache.preloadAssets(urls, {
      staleWhileRevalidate: true
    });
  }
}

/**
 * Generate optimized image URL with caching parameters
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  } = {}
): string {
  const url = new URL(baseUrl, window.location.origin);
  
  if (options.width) url.searchParams.set('w', options.width.toString());
  if (options.height) url.searchParams.set('h', options.height.toString());
  if (options.quality) url.searchParams.set('q', options.quality.toString());
  if (options.format) url.searchParams.set('f', options.format);
  
  return url.toString();
}

/**
 * Check if browser supports modern image formats
 */
export function getSupportedImageFormat(): 'webp' | 'jpg' {
  if (typeof window === 'undefined') return 'jpg';
  
  // Check WebP support
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0 ? 'webp' : 'jpg';
}