/**
 * React hooks for media caching with progressive loading and fallback strategies
 * Integrates with both service worker caching and IndexedDB for optimal performance
 */

import { AssetCacheConfig, AssetLoadProgress, assetCache, cacheImage, cacheVideo } from '@/lib/asset-cache';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface MediaLoadState {
  loading: boolean;
  error: Error | null;
  progress: AssetLoadProgress | null;
  cached: boolean;
  url: string | null;
}

export interface UseCachedVideoOptions {
  src: string;
  preload?: boolean;
  autoCache?: boolean;
  fallbackUrl?: string;
  onProgress?: (progress: AssetLoadProgress) => void;
  onLoad?: (url: string) => void;
  onError?: (error: Error) => void;
  config?: AssetCacheConfig;
}

export interface UseCachedImageOptions {
  src: string;
  preload?: boolean;
  autoCache?: boolean;
  fallbackUrl?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  onProgress?: (progress: AssetLoadProgress) => void;
  onLoad?: (url: string) => void;
  onError?: (error: Error) => void;
  config?: AssetCacheConfig;
}

/**
 * Hook for caching and loading videos with progressive enhancement
 */
export function useCachedVideo(options: UseCachedVideoOptions): MediaLoadState & {
  preload: () => Promise<void>;
  clearCache: () => Promise<void>;
  retry: () => Promise<void>;
} {
  const {
    src,
    preload = false,
    autoCache = true,
    fallbackUrl,
    onProgress,
    onLoad,
    onError,
    config
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<AssetLoadProgress | null>(null);
  const [cached, setCached] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  const handleProgress = useCallback((progressData: AssetLoadProgress) => {
    if (!mountedRef.current) return;
    setProgress(progressData);
    onProgress?.(progressData);
  }, [onProgress]);

  const loadVideo = useCallback(async () => {
    if (loadingRef.current || !src) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    setProgress(null);

    try {
      console.log(`🎬 Loading video: ${src}`);
      
      const cachedUrl = await cacheVideo(src, {
        staleWhileRevalidate: true,
        ...config
      }, handleProgress);
      
      if (!mountedRef.current) return;
      
      setUrl(cachedUrl);
      setCached(cachedUrl !== src);
      setLoading(false);
      setProgress(null);
      
      console.log(`✅ Video loaded: ${src} (cached: ${cachedUrl !== src})`);
      onLoad?.(cachedUrl);
      
    } catch (err) {
      if (!mountedRef.current) return;
      
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(`❌ Video loading failed: ${src}`, error);
      
      // Try fallback URL if available
      if (fallbackUrl && fallbackUrl !== src) {
        try {
          console.log(`🔄 Trying fallback video: ${fallbackUrl}`);
          const fallbackCachedUrl = await cacheVideo(fallbackUrl, config, handleProgress);
          
          if (mountedRef.current) {
            setUrl(fallbackCachedUrl);
            setCached(fallbackCachedUrl !== fallbackUrl);
            setLoading(false);
            setProgress(null);
            console.log(`✅ Fallback video loaded: ${fallbackUrl}`);
            onLoad?.(fallbackCachedUrl);
            return;
          }
        } catch (fallbackErr) {
          console.error(`❌ Fallback video also failed: ${fallbackUrl}`, fallbackErr);
        }
      }
      
      setError(error);
      setLoading(false);
      setProgress(null);
      onError?.(error);
    } finally {
      loadingRef.current = false;
    }
  }, [src, fallbackUrl, config, handleProgress, onLoad, onError]);

  const preloadVideo = useCallback(async () => {
    if (!src) return;
    try {
      await cacheVideo(src, config);
      console.log(`📋 Video preloaded: ${src}`);
    } catch (err) {
      console.warn(`⚠️ Video preload failed: ${src}`, err);
    }
  }, [src, config]);

  const clearCache = useCallback(async () => {
    if (!src) return;
    try {
      // Clear from asset cache
      await assetCache.clearAllAssets();
      
      // Clear from service worker cache
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_CACHE',
          cache: 'onsi-video-v1.1.0'
        });
      }
      
      console.log(`🗑️ Video cache cleared: ${src}`);
    } catch (err) {
      console.warn(`⚠️ Failed to clear video cache: ${src}`, err);
    }
  }, [src]);

  const retry = useCallback(async () => {
    setError(null);
    await loadVideo();
  }, [loadVideo]);

  // Auto-load or preload on mount - prevent infinite loops
  const hasInitializedVideo = useRef(false);
  
  useEffect(() => {
    if (!hasInitializedVideo.current && (autoCache || preload)) {
      hasInitializedVideo.current = true;
      if (preload && !autoCache) {
        preloadVideo();
      } else {
        loadVideo();
      }
    }
  }, [src, autoCache, preload]); // Only depend on src and flags, not functions

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    loading,
    error,
    progress,
    cached,
    url: url || src,
    preload: preloadVideo,
    clearCache,
    retry
  };
}

/**
 * Hook for caching and loading images with optimization
 */
export function useCachedImage(options: UseCachedImageOptions): MediaLoadState & {
  preload: () => Promise<void>;
  clearCache: () => Promise<void>;
  retry: () => Promise<void>;
} {
  const {
    src,
    preload = false,
    autoCache = true,
    fallbackUrl,
    width,
    height,
    quality = 85,
    format = 'auto',
    onProgress,
    onLoad,
    onError,
    config
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<AssetLoadProgress | null>(null);
  const [cached, setCached] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  const handleProgress = useCallback((progressData: AssetLoadProgress) => {
    if (!mountedRef.current) return;
    setProgress(progressData);
    onProgress?.(progressData);
  }, [onProgress]);

  const getOptimizedSrc = useCallback(() => {
    if (!src) return src;
    
    try {
      const url = new URL(src, window.location.origin);
      
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      if (quality && quality !== 85) url.searchParams.set('q', quality.toString());
      if (format && format !== 'auto') url.searchParams.set('f', format);
      
      return url.toString();
    } catch {
      return src;
    }
  }, [src, width, height, quality, format]);

  const loadImage = useCallback(async () => {
    if (loadingRef.current || !src) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    setProgress(null);

    try {
      const optimizedSrc = getOptimizedSrc();
      console.log(`🖼️ Loading image: ${optimizedSrc}`);
      
      const cachedUrl = await cacheImage(optimizedSrc, {
        staleWhileRevalidate: true,
        quality,
        format: format === 'auto' ? undefined : format,
        ...config
      }, handleProgress);
      
      if (!mountedRef.current) return;
      
      setUrl(cachedUrl);
      setCached(cachedUrl !== optimizedSrc);
      setLoading(false);
      setProgress(null);
      
      console.log(`✅ Image loaded: ${optimizedSrc} (cached: ${cachedUrl !== optimizedSrc})`);
      onLoad?.(cachedUrl);
      
    } catch (err) {
      if (!mountedRef.current) return;
      
      const error = err instanceof Error ? err : new Error(String(err));
      console.error(`❌ Image loading failed: ${src}`, error);
      
      // Try fallback URL if available
      if (fallbackUrl && fallbackUrl !== src) {
        try {
          console.log(`🔄 Trying fallback image: ${fallbackUrl}`);
          const fallbackCachedUrl = await cacheImage(fallbackUrl, config, handleProgress);
          
          if (mountedRef.current) {
            setUrl(fallbackCachedUrl);
            setCached(fallbackCachedUrl !== fallbackUrl);
            setLoading(false);
            setProgress(null);
            console.log(`✅ Fallback image loaded: ${fallbackUrl}`);
            onLoad?.(fallbackCachedUrl);
            return;
          }
        } catch (fallbackErr) {
          console.error(`❌ Fallback image also failed: ${fallbackUrl}`, fallbackErr);
        }
      }
      
      setError(error);
      setLoading(false);
      setProgress(null);
      onError?.(error);
    } finally {
      loadingRef.current = false;
    }
  }, [src, fallbackUrl, getOptimizedSrc, quality, format, config, handleProgress, onLoad, onError]);

  const preloadImage = useCallback(async () => {
    if (!src) return;
    try {
      const optimizedSrc = getOptimizedSrc();
      await cacheImage(optimizedSrc, { quality, format: format === 'auto' ? undefined : format, ...config });
      console.log(`📋 Image preloaded: ${optimizedSrc}`);
    } catch (err) {
      console.warn(`⚠️ Image preload failed: ${src}`, err);
    }
  }, [src, getOptimizedSrc, quality, format, config]);

  const clearCache = useCallback(async () => {
    if (!src) return;
    try {
      // Clear from asset cache
      await assetCache.clearAllAssets();
      
      // Clear from service worker cache
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_CACHE',
          cache: 'onsi-image-v1.1.0'
        });
      }
      
      console.log(`🗑️ Image cache cleared: ${src}`);
    } catch (err) {
      console.warn(`⚠️ Failed to clear image cache: ${src}`, err);
    }
  }, [src]);

  const retry = useCallback(async () => {
    setError(null);
    await loadImage();
  }, [loadImage]);

  // Auto-load or preload on mount - prevent infinite loops
  const hasInitializedImage = useRef(false);
  
  useEffect(() => {
    if (!hasInitializedImage.current && (autoCache || preload)) {
      hasInitializedImage.current = true;
      if (preload && !autoCache) {
        preloadImage();
      } else {
        loadImage();
      }
    }
  }, [src, autoCache, preload, width, height, quality, format]); // Only depend on src and options

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    loading,
    error,
    progress,
    cached,
    url: url || src,
    preload: preloadImage,
    clearCache,
    retry
  };
}

/**
 * Hook for preloading multiple media assets
 */
export function useMediaPreloader() {
  const [preloadStatus, setPreloadStatus] = useState<{
    total: number;
    loaded: number;
    loading: boolean;
    errors: string[];
  }>({
    total: 0,
    loaded: 0,
    loading: false,
    errors: []
  });

  const preloadAssets = useCallback(async (
    assets: Array<{ url: string; type: 'video' | 'image'; config?: AssetCacheConfig }>
  ) => {
    setPreloadStatus({
      total: assets.length,
      loaded: 0,
      loading: true,
      errors: []
    });

    const errors: string[] = [];
    let loaded = 0;

    const promises = assets.map(async (asset) => {
      try {
        if (asset.type === 'video') {
          await cacheVideo(asset.url, asset.config);
        } else {
          await cacheImage(asset.url, asset.config);
        }
        loaded++;
        setPreloadStatus(prev => ({ ...prev, loaded }));
      } catch (error) {
        const errorMsg = `Failed to preload ${asset.type}: ${asset.url}`;
        errors.push(errorMsg);
        console.warn(errorMsg, error);
      }
    });

    await Promise.allSettled(promises);

    setPreloadStatus(prev => ({
      ...prev,
      loading: false,
      errors
    }));

    console.log(`📋 Preloading completed: ${loaded}/${assets.length} assets loaded`);
  }, []);

  const clearAllCache = useCallback(async () => {
    try {
      await assetCache.clearAllAssets();
      
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_CACHE',
          cache: 'all'
        });
      }
      
      console.log('🗑️ All media cache cleared');
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }, []);

  return {
    preloadStatus,
    preloadAssets,
    clearAllCache
  };
}