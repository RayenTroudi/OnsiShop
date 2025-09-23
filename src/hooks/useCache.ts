/**
 * React hooks for managing cached content with automatic refresh
 * and background updates for optimal user experience
 */

import { CACHE_CONFIGS, CACHE_KEYS, CacheConfig, cacheManager } from '@/lib/browser-cache';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCachedContentOptions {
  cacheKey: string;
  fetcher: () => Promise<any>;
  config?: CacheConfig;
  refreshOnMount?: boolean;
  backgroundRefresh?: boolean;
  onError?: (error: Error) => void;
  onSuccess?: (data: any) => void;
}

export interface CachedContentState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fromCache: boolean;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
  clearCache: () => Promise<void>;
}

/**
 * Hook for managing cached content with automatic refresh
 */
export function useCachedContent<T = any>({
  cacheKey,
  fetcher,
  config = CACHE_CONFIGS.CONTENT,
  refreshOnMount = true,
  backgroundRefresh = true,
  onError,
  onSuccess
}: UseCachedContentOptions): CachedContentState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  
  const backgroundFetchRef = useRef<Promise<void> | null>(null);

  const fetchData = useCallback(async (forceRefresh = false): Promise<void> => {
    try {
      console.log(`🎯 fetchData called: cacheKey="${cacheKey}", forceRefresh=${forceRefresh}`);
      setLoading(true);
      setError(null);

      let cachedData: T | null = null;
      
      // Try to get cached data first (unless forcing refresh)
      if (!forceRefresh) {
        console.log(`🔍 About to call cacheManager.get for key: ${cacheKey}`);
        cachedData = await cacheManager.get<T>(cacheKey, config);
        console.log(`📦 cacheManager.get result:`, cachedData ? 'data found' : 'no data');
        
        if (cachedData) {
          setData(cachedData);
          setFromCache(true);
          setLastUpdated(Date.now());
          setLoading(false);
          
          if (onSuccess) {
            onSuccess(cachedData);
          }
          
          // If background refresh is enabled, update cache in background
          if (backgroundRefresh && !backgroundFetchRef.current) {
            backgroundFetchRef.current = updateCacheInBackground();
          }
          
          return;
        }
      }

      // No cache or forcing refresh - fetch from network
      const freshData = await fetcherRef.current();
      
      // Update state with fresh data
      setData(freshData);
      setFromCache(false);
      setLastUpdated(Date.now());
      setLoading(false);
      
      // Cache the fresh data
      console.log(`💾 About to call cacheManager.set for key: ${cacheKey}`);
      await cacheManager.set(cacheKey, freshData, config);
      console.log(`✅ cacheManager.set completed for key: ${cacheKey}`);
      
      if (onSuccess) {
        onSuccess(freshData);
      }
      
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setLoading(false);
      
      // Try to serve stale cache on error
      try {
        const staleData = await cacheManager.get<T>(cacheKey, { ...config, version: 'any' });
        if (staleData) {
          setData(staleData);
          setFromCache(true);
          setLastUpdated(Date.now());
          console.warn(`Serving stale cache for ${cacheKey} due to error:`, errorObj);
        }
      } catch (cacheErr) {
        // No stale cache available
      }
      
      if (onError) {
        onError(errorObj);
      }
    } finally {
      backgroundFetchRef.current = null;
    }
  }, [cacheKey, JSON.stringify(config), backgroundRefresh]); // Simplified dependencies

  const updateCacheInBackground = useCallback(async (): Promise<void> => {
    try {
      console.log(`🔄 Background refresh: ${cacheKey}`);
      const freshData = await fetcherRef.current();
      
      // Only update cache, don't change UI state to avoid flickering
      await cacheManager.set(cacheKey, freshData, config);
      console.log(`✅ Background cache updated: ${cacheKey}`);
    } catch (err) {
      console.warn(`⚠️ Background refresh failed for ${cacheKey}:`, err);
    }
  }, [cacheKey, config]);

  const refresh = useCallback(async (): Promise<void> => {
    await fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(async (): Promise<void> => {
    await cacheManager.remove(cacheKey, config);
    setFromCache(false);
    console.log(`🗑️ Cache cleared: ${cacheKey}`);
  }, [cacheKey, config]);

  // Initial fetch on mount - only run once
  const hasInitialized = useRef(false);
  
  useEffect(() => {
    if (refreshOnMount && !hasInitialized.current) {
      hasInitialized.current = true;
      fetchData();
    }
  }, [refreshOnMount]); // Remove fetchData from dependencies to prevent loops

  return {
    data,
    loading,
    error,
    fromCache,
    lastUpdated,
    refresh,
    clearCache
  };
}

/**
 * Hook for managing hero content specifically
 */
export function useHeroContent() {
  return useCachedContent<Record<string, string>>({
    cacheKey: CACHE_KEYS.CONTENT,
    fetcher: async () => {
      const response = await fetch('/api/content', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      // Don't cache auth errors
      if (response.status === 401 || response.status === 403) {
        console.warn('🚫 Auth error in content fetch, not caching');
        throw new Error(`Authentication required: ${response.statusText}`);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch content: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch content');
      }
      
      return result.data || {};
    },
    config: CACHE_CONFIGS.CONTENT,
    backgroundRefresh: true,
    onError: (error) => {
      // Handle auth errors gracefully
      if (error.message.includes('Authentication required')) {
        console.warn('🔐 Content requires authentication, continuing with cached data or defaults');
      }
    }
  });
}

/**
 * Hook for managing categories with caching
 */
export function useCachedCategories() {
  return useCachedContent<any[]>({
    cacheKey: CACHE_KEYS.CATEGORIES,
    fetcher: async () => {
      const response = await fetch('/api/categories');
      
      // Don't cache auth errors
      if (response.status === 401 || response.status === 403) {
        console.warn('🚫 Auth error in categories fetch, not caching');
        throw new Error(`Authentication required: ${response.statusText}`);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }
      return response.json();
    },
    config: CACHE_CONFIGS.CONTENT,
    backgroundRefresh: true,
    onError: (error) => {
      if (error.message.includes('Authentication required')) {
        console.warn('🔐 Categories require authentication, using cached data or empty array');
      }
    }
  });
}

/**
 * Hook for managing products with caching
 */
export function useCachedProducts(collection?: string, limit?: number) {
  const queryParams = new URLSearchParams();
  if (collection) queryParams.append('collection', collection);
  if (limit) queryParams.append('limit', limit.toString());
  
  const cacheKey = `${CACHE_KEYS.PRODUCTS}_${queryParams.toString()}`;
  
  return useCachedContent<any[]>({
    cacheKey,
    fetcher: async () => {
      const response = await fetch(`/api/products?${queryParams}`);
      
      // Don't cache auth errors
      if (response.status === 401 || response.status === 403) {
        console.warn('🚫 Auth error in products fetch, not caching');
        throw new Error(`Authentication required: ${response.statusText}`);
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.statusText}`);
      }
      return response.json();
    },
    config: CACHE_CONFIGS.CONTENT,
    backgroundRefresh: true,
    onError: (error) => {
      if (error.message.includes('Authentication required')) {
        console.warn('🔐 Products require authentication, using cached data or empty array');
      }
    }
  });
}

/**
 * Hook for service worker management
 */
export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      setIsSupported(true);
      
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('✅ Service Worker registered:', reg.scope);
          setRegistration(reg);
          setIsRegistered(true);
          
          // Handle updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 New Service Worker available');
                  // Could show update notification here
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    }
  }, []);

  const clearCache = useCallback((cacheName?: string) => {
    if (registration && registration.active) {
      registration.active.postMessage({
        type: 'CLEAR_CACHE',
        cache: cacheName || 'all'
      });
    }
  }, [registration]);

  const updateServiceWorker = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  return {
    isSupported,
    isRegistered,
    registration,
    clearCache,
    updateServiceWorker
  };
}

/**
 * Hook for managing user authentication with caching
 */
export function useAuthWithCache() {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.status === 401 || response.status === 403) {
        // Not authenticated - this is normal, not an error
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        console.log('🔐 User not authenticated');
        return;
      }

      if (!response.ok) {
        throw new Error(`Auth check failed: ${response.statusText}`);
      }

      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
      console.log('✅ User authenticated:', userData.email || userData.username || 'Unknown');
      
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      console.warn('⚠️ Auth check error (non-critical):', errorObj.message);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    refreshAuth: checkAuth
  };
}

/**
 * Hook for cache statistics and management
 */
export function useCacheStats() {
  const [stats, setStats] = useState({
    memoryItems: 0,
    localStorageItems: 0,
    sessionStorageItems: 0,
    totalSize: 0
  });

  const refreshStats = useCallback(async () => {
    const newStats = await cacheManager.getStats();
    setStats(newStats);
  }, []);

  const clearAllCache = useCallback(async () => {
    await cacheManager.clear();
    await refreshStats();
  }, [refreshStats]);

  const clearCacheByPrefix = useCallback(async (prefix: string) => {
    await cacheManager.clear(prefix);
    await refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    refreshStats,
    clearAllCache,
    clearCacheByPrefix
  };
}