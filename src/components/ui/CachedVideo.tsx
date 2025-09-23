'use client';

import { useCachedVideo, UseCachedVideoOptions } from '@/hooks/useMediaCache';
import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

export interface CachedVideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  src: string;
  fallbackSrc?: string;
  poster?: string;
  showProgress?: boolean;
  progressClassName?: string;
  errorFallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  preload?: 'none' | 'metadata' | 'auto' | 'cache';
  cacheConfig?: UseCachedVideoOptions['config'];
  onCacheLoad?: (cached: boolean) => void;
  onCacheError?: (error: Error) => void;
  retryable?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'auto';
}

/**
 * CachedVideo component with intelligent caching, progressive loading, and fallbacks
 * Automatically handles video caching with service worker and IndexedDB integration
 */
export const CachedVideo = forwardRef<HTMLVideoElement, CachedVideoProps>(({
  src,
  fallbackSrc,
  poster,
  showProgress = false,
  progressClassName = '',
  errorFallback,
  loadingFallback,
  preload = 'cache',
  cacheConfig,
  onCacheLoad,
  onCacheError,
  retryable = true,
  quality = 'auto',
  className = '',
  style,
  onLoad,
  onError,
  onLoadStart,
  onProgress,
  ...videoProps
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState<Error | null>(null);
  const [showRetry, setShowRetry] = useState(false);

  // Use the cached video hook
  const {
    loading: cacheLoading,
    error: cacheError,
    progress: cacheProgress,
    cached,
    url: cachedUrl,
    retry: retryCache
  } = useCachedVideo({
    src,
    fallbackUrl: fallbackSrc,
    preload: preload === 'cache' || preload === 'auto',
    autoCache: preload !== 'none',
    config: {
      staleWhileRevalidate: true,
      ...cacheConfig
    },
    onLoad: (url) => {
      console.log(`🎬 Video cache loaded: ${src} -> ${url} (cached: ${cached})`);
      onCacheLoad?.(cached);
    },
    onError: (error) => {
      console.error(`❌ Video cache error: ${src}`, error);
      onCacheError?.(error);
      setShowRetry(retryable);
    }
  });

  // Combine refs
  const combinedRef = useCallback((element: HTMLVideoElement | null) => {
    if (videoRef.current !== element) {
      (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = element;
    }
    if (ref) {
      if (typeof ref === 'function') {
        ref(element);
      } else {
        (ref as React.MutableRefObject<HTMLVideoElement | null>).current = element;
      }
    }
  }, [ref]);

  // Handle video element events
  const handleVideoLoad = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    setVideoLoaded(true);
    setVideoError(null);
    setShowRetry(false);
    onLoad?.(e);
  }, [onLoad]);

  // Handle cached URL availability
  useEffect(() => {
    if (cachedUrl && cached && !cacheLoading && !cacheError) {
      console.log(`🚀 Cached video URL available: ${cachedUrl.startsWith('data:') ? 'data URL' : cachedUrl}`);
      // Notify that cache is loaded
      onCacheLoad?.(true);
      
      // For data URLs (base64), the video is immediately available
      // We should trigger onLoad after a short delay to simulate normal loading
      if (cachedUrl.startsWith('data:')) {
        console.log('📦 Video is base64 data URL - triggering immediate load completion');
        setTimeout(() => {
          if (videoRef.current) {
            // Create a synthetic load event
            const loadEvent = new Event('load', { bubbles: true });
            Object.defineProperty(loadEvent, 'target', { 
              value: videoRef.current, 
              writable: false 
            });
            handleVideoLoad(loadEvent as any);
          }
        }, 100);
      }
    }
  }, [cachedUrl, cached, cacheLoading, cacheError, onCacheLoad, handleVideoLoad]);

  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const error = new Error('Video element failed to load');
    setVideoError(error);
    setVideoLoaded(false);
    if (retryable && !cacheError) {
      setShowRetry(true);
    }
    onError?.(e);
  }, [onError, retryable, cacheError]);

  const handleVideoLoadStart = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    setVideoLoaded(false);
    setVideoError(null);
    onLoadStart?.(e);
  }, [onLoadStart]);

  const handleVideoProgress = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    onProgress?.(e);
  }, [onProgress]);

  // Retry function
  const handleRetry = useCallback(async () => {
    setShowRetry(false);
    setVideoError(null);
    setVideoLoaded(false);
    
    if (cacheError) {
      await retryCache();
    } else if (videoRef.current) {
      videoRef.current.load();
    }
  }, [cacheError, retryCache]);

  // Get quality-adjusted URL
  const getQualityUrl = useCallback((url: string) => {
    if (quality === 'auto' || !url) return url;
    
    try {
      const urlObj = new URL(url, window.location.origin);
      
      switch (quality) {
        case 'low':
          urlObj.searchParams.set('quality', '480p');
          break;
        case 'medium':
          urlObj.searchParams.set('quality', '720p');
          break;
        case 'high':
          urlObj.searchParams.set('quality', '1080p');
          break;
      }
      
      return urlObj.toString();
    } catch {
      return url;
    }
  }, [quality]);

  // Loading state component
  const renderLoading = () => {
    if (loadingFallback) {
      return loadingFallback;
    }

    return (
      <div 
        className={`flex items-center justify-center bg-gray-900 text-white ${className}`}
        style={style}
      >
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <div className="text-sm">Loading video...</div>
          {showProgress && cacheProgress && (
            <div className={`mt-2 ${progressClassName}`}>
              <div className="text-xs mb-1">
                {cacheProgress.percentage}% ({Math.round(cacheProgress.loaded / 1024)}KB / {Math.round(cacheProgress.total / 1024)}KB)
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${cacheProgress.percentage}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Error state component
  const renderError = () => {
    if (errorFallback) {
      return errorFallback;
    }

    return (
      <div 
        className={`flex items-center justify-center bg-gray-900 text-white ${className}`}
        style={style}
      >
        <div className="text-center p-4">
          <div className="text-red-400 mb-2">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm mb-3">
            {cacheError ? 'Failed to load video' : 'Video playback error'}
          </div>
          {showRetry && (
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  };

  // Show loading state
  if (cacheLoading && !cachedUrl) {
    return renderLoading();
  }

  // Show error state
  if ((cacheError || videoError) && !cachedUrl) {
    return renderError();
  }

  // Render video element
  const videoUrl = getQualityUrl(cachedUrl || src);

  return (
    <div className="relative">
      <video
        ref={combinedRef}
        src={videoUrl}
        poster={poster}
        className={className}
        style={style}
        onLoad={handleVideoLoad}
        onError={handleVideoError}
        onLoadStart={handleVideoLoadStart}
        onProgress={handleVideoProgress}
        preload={preload === 'cache' ? 'metadata' : preload}
        {...videoProps}
      />
      
      {/* Cache indicator */}
      {cached && (
        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded opacity-75">
          Cached
        </div>
      )}
      
      {/* Loading overlay for cache loading */}
      {cacheLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
            <div className="text-xs">Optimizing...</div>
            {showProgress && cacheProgress && (
              <div className="text-xs mt-1">
                {cacheProgress.percentage}%
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Error overlay */}
      {(cacheError || videoError) && showRetry && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
});

CachedVideo.displayName = 'CachedVideo';

export default CachedVideo;