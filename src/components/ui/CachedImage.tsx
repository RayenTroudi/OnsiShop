'use client';

import { useCachedImage, UseCachedImageOptions } from '@/hooks/useMediaCache';
import Image, { ImageProps } from 'next/image';
import React, { forwardRef, useCallback, useState } from 'react';

export interface CachedImageProps extends Omit<ImageProps, 'src' | 'onLoad' | 'onError'> {
  src: string;
  fallbackSrc?: string;
  showProgress?: boolean;
  progressClassName?: string;
  errorFallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  cacheConfig?: UseCachedImageOptions['config'];
  onCacheLoad?: (cached: boolean) => void;
  onCacheError?: (error: Error) => void;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  retryable?: boolean;
  lazy?: boolean;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  optimized?: boolean;
}

/**
 * CachedImage component with intelligent caching, Next.js Image optimization, and fallbacks
 * Combines Next.js Image component with advanced caching capabilities
 */
export const CachedImage = forwardRef<HTMLImageElement, CachedImageProps>(({
  src,
  alt,
  fallbackSrc,
  width,
  height,
  showProgress = false,
  progressClassName = '',
  errorFallback,
  loadingFallback,
  cacheConfig,
  onCacheLoad,
  onCacheError,
  onLoad,
  onError,
  retryable = true,
  lazy = true,
  quality = 85,
  format = 'auto',
  optimized = true,
  className = '',
  style,
  priority = false,
  ...imageProps
}, ref) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState<Error | null>(null);
  const [showRetry, setShowRetry] = useState(false);
  const [inView, setInView] = useState(!lazy || priority);

  // Use the cached image hook
  const {
    loading: cacheLoading,
    error: cacheError,
    progress: cacheProgress,
    cached,
    url: cachedUrl,
    retry: retryCache
  } = useCachedImage({
    src,
    fallbackUrl: fallbackSrc,
    preload: !lazy || priority,
    autoCache: inView || !lazy || priority,
    width: typeof width === 'number' ? width : undefined,
    height: typeof height === 'number' ? height : undefined,
    quality: optimized ? quality : undefined,
    format: optimized && format !== 'auto' ? format : 'auto',
    config: {
      staleWhileRevalidate: true,
      ...cacheConfig
    },
    onLoad: (url) => {
      console.log(`🖼️ Image cache loaded: ${src} -> ${url}`);
      onCacheLoad?.(cached);
    },
    onError: (error) => {
      console.error(`❌ Image cache error: ${src}`, error);
      onCacheError?.(error);
      setShowRetry(retryable);
    }
  });

  // Intersection observer for lazy loading
  const imageRef = useCallback((element: HTMLImageElement | null) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(element);
      } else {
        (ref as React.MutableRefObject<HTMLImageElement | null>).current = element;
      }
    }

    if (!element || !lazy || priority || inView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.1
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, lazy, priority, inView]);

  // Handle image events
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(null);
    setShowRetry(false);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback((error?: Error) => {
    const imageError = error || new Error('Image failed to load');
    setImageError(imageError);
    setImageLoaded(false);
    if (retryable && !cacheError) {
      setShowRetry(true);
    }
    onError?.(imageError);
  }, [onError, retryable, cacheError]);

  // Retry function
  const handleRetry = useCallback(async () => {
    setShowRetry(false);
    setImageError(null);
    setImageLoaded(false);
    
    if (cacheError) {
      await retryCache();
    }
    // For Next.js Image, we don't need to manually reload
  }, [cacheError, retryCache]);

  // Loading placeholder
  const renderLoading = () => {
    if (loadingFallback) {
      return loadingFallback;
    }

    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 animate-pulse ${className}`}
        style={{ ...style, width, height }}
      >
        <div className="text-center p-2">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
          {showProgress && cacheProgress && (
            <div className={`text-xs text-gray-600 ${progressClassName}`}>
              {cacheProgress.percentage}%
            </div>
          )}
        </div>
      </div>
    );
  };

  // Error placeholder
  const renderError = () => {
    if (errorFallback) {
      return errorFallback;
    }

    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 ${className}`}
        style={{ ...style, width, height }}
      >
        <div className="text-center p-2">
          <div className="text-gray-400 mb-2">
            <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {cacheError ? 'Failed to load' : 'Image error'}
          </div>
          {showRetry && (
            <button
              onClick={handleRetry}
              className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  };

  // Lazy loading placeholder
  if (lazy && !priority && !inView) {
    return (
      <div 
        ref={imageRef}
        className={`bg-gray-200 ${className}`}
        style={{ ...style, width, height }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-400">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (cacheLoading && !cachedUrl) {
    return renderLoading();
  }

  // Show error state
  if ((cacheError || imageError) && !cachedUrl) {
    return renderError();
  }

  // Render optimized Next.js Image
  const imageUrl = cachedUrl || src;
  const isExternal = imageUrl.startsWith('http') && !imageUrl.startsWith(window.location.origin);

  return (
    <div className="relative">
      <Image
        ref={imageRef}
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        quality={optimized ? quality : undefined}
        priority={priority}
        className={className}
        style={style}
        onLoad={handleImageLoad}
        onError={() => handleImageError()}
        unoptimized={!optimized || isExternal}
        {...imageProps}
      />
      
      {/* Cache indicator */}
      {cached && (
        <div className="absolute top-1 right-1 bg-green-600 text-white text-xs px-1 py-0.5 rounded opacity-75">
          ⚡
        </div>
      )}
      
      {/* Loading overlay */}
      {cacheLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-gray-600 text-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-1"></div>
            {showProgress && cacheProgress && (
              <div className="text-xs">
                {cacheProgress.percentage}%
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Error overlay */}
      {(cacheError || imageError) && showRetry && (
        <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
          <button
            onClick={handleRetry}
            className="px-2 py-1 bg-white text-red-600 text-xs rounded hover:bg-gray-100 transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
});

CachedImage.displayName = 'CachedImage';

export default CachedImage;