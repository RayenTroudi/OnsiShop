/**
 * Cache Invalidation Utilities
 * Handles cache invalidation when content is updated via admin panel
 */

import { CACHE_KEYS, cacheManager } from '@/lib/browser-cache';
import { NextResponse } from 'next/server';

export interface CacheInvalidationOptions {
  keys?: string[];
  patterns?: string[];
  clearAll?: boolean;
  notifyClients?: boolean;
}

/**
 * Server-side cache invalidation response headers
 */
export function addCacheInvalidationHeaders(
  response: NextResponse, 
  options: CacheInvalidationOptions = {}
): NextResponse {
  const { keys = [], patterns = [], clearAll = false } = options;
  
  // Add custom headers to tell clients to invalidate cache
  if (clearAll) {
    response.headers.set('X-Cache-Invalidate', 'all');
  } else if (keys.length > 0) {
    response.headers.set('X-Cache-Invalidate', keys.join(','));
  } else if (patterns.length > 0) {
    response.headers.set('X-Cache-Invalidate-Patterns', patterns.join(','));
  }
  
  // Add cache-control headers to prevent caching of this response
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

/**
 * Client-side cache invalidation
 */
export async function invalidateClientCache(options: CacheInvalidationOptions = {}): Promise<void> {
  const { keys = [], patterns = [], clearAll = false } = options;
  
  try {
    if (clearAll) {
      await cacheManager.clear();
      console.log('🧹 All cache cleared');
    } else {
      // Clear specific keys
      for (const key of keys) {
        await cacheManager.remove(key);
        console.log(`🗑️ Cache cleared: ${key}`);
      }
      
      // Clear by patterns
      for (const pattern of patterns) {
        await cacheManager.clear(pattern);
        console.log(`🗑️ Cache pattern cleared: ${pattern}`);
      }
    }
    
    // Notify service worker if available
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_CACHE',
        cache: clearAll ? 'all' : keys[0] || patterns[0]
      });
    }
  } catch (error) {
    console.error('❌ Cache invalidation failed:', error);
  }
}

/**
 * Content-specific cache invalidation
 */
export async function invalidateContentCache(updatedKeys: string[] = []): Promise<void> {
  const keysToInvalidate: string[] = [CACHE_KEYS.CONTENT];
  
  // Add specific keys if they relate to cached content
  if (updatedKeys.includes('hero_background_video')) {
    keysToInvalidate.push(CACHE_KEYS.HERO_VIDEO);
  }
  
  if (updatedKeys.includes('hero_background_image')) {
    keysToInvalidate.push(CACHE_KEYS.HERO_IMAGE);
  }
  
  await invalidateClientCache({
    keys: keysToInvalidate,
    patterns: ['content_', 'hero_']
  });
}

/**
 * API Response wrapper that handles cache invalidation
 */
export function createCacheInvalidationResponse(
  data: any, 
  options: CacheInvalidationOptions & { status?: number } = {}
): NextResponse {
  const { status = 200, ...cacheOptions } = options;
  
  const response = NextResponse.json(data, { status });
  return addCacheInvalidationHeaders(response, cacheOptions);
}

/**
 * Hook to listen for cache invalidation headers in API responses
 */
export function setupCacheInvalidationListener(): void {
  if (typeof window === 'undefined') return;
  
  // Override fetch to check for cache invalidation headers
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const response = await originalFetch(input, init);
    
    // Check for cache invalidation headers
    const invalidateHeader = response.headers.get('X-Cache-Invalidate');
    const invalidatePatternsHeader = response.headers.get('X-Cache-Invalidate-Patterns');
    
    if (invalidateHeader === 'all') {
      await invalidateClientCache({ clearAll: true });
    } else if (invalidateHeader) {
      const keys = invalidateHeader.split(',').map(k => k.trim());
      await invalidateClientCache({ keys });
    }
    
    if (invalidatePatternsHeader) {
      const patterns = invalidatePatternsHeader.split(',').map(p => p.trim());
      await invalidateClientCache({ patterns });
    }
    
    return response;
  };
}

/**
 * Cache versioning for content updates
 */
export function generateCacheVersion(contentKeys: string[] = []): string {
  const timestamp = Date.now();
  const keyHash = contentKeys.sort().join('|');
  return `v${timestamp}-${btoa(keyHash).slice(0, 8)}`;
}

/**
 * Content update broadcast for real-time cache invalidation
 */
export function broadcastCacheInvalidation(
  keys: string[] = [], 
  patterns: string[] = []
): void {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    const channel = new BroadcastChannel('onsi-cache-invalidation');
    
    channel.postMessage({
      type: 'CACHE_INVALIDATE',
      keys,
      patterns,
      timestamp: Date.now()
    });
  }
}

/**
 * Listen for broadcast cache invalidation messages
 */
export function setupBroadcastCacheListener(): void {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    const channel = new BroadcastChannel('onsi-cache-invalidation');
    
    channel.addEventListener('message', async (event) => {
      if (event.data?.type === 'CACHE_INVALIDATE') {
        const { keys, patterns } = event.data;
        await invalidateClientCache({ keys, patterns });
        
        console.log('🔄 Cache invalidated via broadcast:', { keys, patterns });
      }
    });
  }
}