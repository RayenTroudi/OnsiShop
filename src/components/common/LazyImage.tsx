'use client';

import { useLoading } from '@/contexts/LoadingContext';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  unoptimized?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  quality?: number;
  style?: React.CSSProperties;
  trackGlobalLoading?: boolean;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  className = '',
  priority = false,
  unoptimized = false,
  onLoad,
  onError,
  placeholder = 'empty',
  blurDataURL,
  objectFit = 'cover',
  quality = 75,
  style,
  trackGlobalLoading = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // If priority, load immediately
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const loadingTaskId = useRef<string>();
  
  // Use loading context if available (but don't throw if not available)
  let loadingContext: ReturnType<typeof useLoading> | null = null;
  try {
    loadingContext = useLoading();
  } catch {
    // Loading context not available, that's okay
  }

  useEffect(() => {
    // Skip intersection observer if priority is set
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before entering viewport
      }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
    
    // Remove from global loading if tracking
    if (trackGlobalLoading && loadingTaskId.current && loadingContext) {
      loadingContext.removeLoadingTask(loadingTaskId.current);
    }
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
    
    // Remove from global loading if tracking
    if (trackGlobalLoading && loadingTaskId.current && loadingContext) {
      loadingContext.removeLoadingTask(loadingTaskId.current);
    }
  };

  // Add to global loading when starting to load
  useEffect(() => {
    if (trackGlobalLoading && isInView && !isLoaded && !hasError && loadingContext) {
      loadingTaskId.current = `image-${Date.now()}-${Math.random()}`;
      loadingContext.addLoadingTask(loadingTaskId.current);
    }
  }, [isInView, isLoaded, hasError, trackGlobalLoading, loadingContext]);

  const containerClasses = `
    relative transition-all duration-500 ease-out
    ${className}
    ${!isLoaded && !hasError ? 'animate-pulse' : ''}
  `.trim();

  const imageClasses = `
    transition-opacity duration-500 ease-out
    ${isLoaded ? 'opacity-100' : 'opacity-0'}
    ${objectFit === 'cover' ? 'object-cover' : ''}
    ${objectFit === 'contain' ? 'object-contain' : ''}
    ${objectFit === 'fill' ? 'object-fill' : ''}
    ${objectFit === 'none' ? 'object-none' : ''}
    ${objectFit === 'scale-down' ? 'object-scale-down' : ''}
  `.trim();

  return (
    <div 
      ref={imgRef} 
      className={containerClasses}
      style={style}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className={`
          absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 
          animate-pulse bg-[length:200%_100%] animate-shimmer
          ${fill ? '' : `w-[${width}px] h-[${height}px]`}
        `}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 text-gray-400">
              <svg
                className="animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className={`
          absolute inset-0 bg-gray-100 border-2 border-dashed border-gray-300
          flex items-center justify-center
          ${fill ? '' : `w-[${width}px] h-[${height}px]`}
        `}>
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 mx-auto mb-2 text-gray-400">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm">Image failed to load</p>
          </div>
        </div>
      )}

      {/* Actual image - only render when in view */}
      {isInView && !hasError && (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          sizes={sizes}
          className={imageClasses}
          priority={priority}
          unoptimized={unoptimized}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          quality={quality}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;