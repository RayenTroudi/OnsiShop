'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  muted?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onError?: (error: string) => void;
  fallbackComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
}

const LazyVideo: React.FC<LazyVideoProps> = ({
  src,
  poster,
  className = '',
  style = {},
  muted = true,
  autoPlay = true,
  loop = true,
  playsInline = true,
  onLoadStart,
  onLoadComplete,
  onError,
  fallbackComponent,
  loadingComponent,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer setup
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !isIntersecting) {
          setIsIntersecting(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, isIntersecting]);

  // Video loading handlers
  const handleLoadStart = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleProgress = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (duration > 0) {
          setProgress((bufferedEnd / duration) * 100);
        }
      }
    }
  }, []);

  const handleCanPlay = useCallback(() => {
    setCanPlay(true);
    setIsLoading(false);
  }, []);

  const handleCanPlayThrough = useCallback(() => {
    setIsLoaded(true);
    setIsLoading(false);
    onLoadComplete?.();
  }, [onLoadComplete]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const errorMessage = `Failed to load video: ${src}`;
    setHasError(true);
    setIsLoading(false);
    onError?.(errorMessage);
  }, [src, onError]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current && autoPlay) {
      // Attempt to play the video once metadata is loaded
      videoRef.current.play().catch((error) => {
        console.warn('Autoplay failed:', error);
      });
    }
  }, [autoPlay]);

  // Default loading component
  const defaultLoadingComponent = (
    <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center">
      <div className="bg-black/50 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
          <span className="text-white text-sm font-medium">Loading video...</span>
        </div>
        {progress > 0 && (
          <div className="mt-2 w-32 bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-white h-1.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );

  // Default fallback component
  const defaultFallbackComponent = (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-white/10">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm opacity-80">Video unavailable</p>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`} style={style}>
      {/* Show video only when intersecting */}
      {isIntersecting && !hasError && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted={muted}
          autoPlay={autoPlay}
          loop={loop}
          playsInline={playsInline}
          preload="metadata"
          className={`w-full h-full object-cover transition-opacity duration-700 ease-out ${
            isLoaded && canPlay ? 'opacity-100' : 'opacity-0'
          }`}
          onLoadStart={handleLoadStart}
          onProgress={handleProgress}
          onCanPlay={handleCanPlay}
          onCanPlayThrough={handleCanPlayThrough}
          onError={handleError}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}

      {/* Poster image as placeholder */}
      {poster && (!isIntersecting || (!isLoaded && !hasError)) && (
        <img
          src={poster}
          alt="Video poster"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Loading state */}
      {isIntersecting && isLoading && !hasError && (
        loadingComponent || defaultLoadingComponent
      )}

      {/* Error state */}
      {hasError && (
        fallbackComponent || defaultFallbackComponent
      )}

      {/* Smooth fade-in overlay while loading */}
      {isIntersecting && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-black/10 transition-opacity duration-700 ease-out" />
      )}
    </div>
  );
};

export default LazyVideo;