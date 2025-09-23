'use client';

import CachedImage from '@/components/ui/CachedImage';
import { useLoading } from '@/contexts/LoadingContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { useHeroContent, useServiceWorker } from '@/hooks/useCache';
import { preloadHeroAssets } from '@/lib/asset-cache';
import { DEFAULT_CONTENT_VALUES, getContentValue } from '@/lib/content-manager';
import { FALLBACK_CONTENT, getQuickContent } from '@/lib/quick-content';
import { useEffect, useRef, useState } from 'react';

const HeroSection = () => {
  const { t } = useTranslation();
  const { addLoadingTask, removeLoadingTask } = useLoading();
  
  // Use cached content with automatic background refresh
  const {
    data: content,
    loading: contentLoading,
    error: contentError,
    fromCache,
    refresh: refreshContent
  } = useHeroContent();
  
  // Fallback content state
  const [fallbackContent, setFallbackContent] = useState<any>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  
  // Service worker for additional caching
  const { isRegistered: swRegistered } = useServiceWorker();
  
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoTaskAdded, setVideoTaskAdded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Handle fallback content when main content fails
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    
    if (contentLoading && !usingFallback) {
      // Set a timeout to use fallback if content takes too long
      timeoutId = setTimeout(async () => {
        console.log('⏰ Content loading timeout, using fallback content');
        const quickContent = await getQuickContent();
        setFallbackContent(quickContent);
        setUsingFallback(true);
      }, 3000); // 3 second timeout
    } else if (contentError) {
      // Use fallback immediately on error
      console.log('❌ Content error detected, using fallback content');
      getQuickContent().then(quickContent => {
        setFallbackContent(quickContent);
        setUsingFallback(true);
      });
    } else if (content && !contentError) {
      // Successfully loaded content, clear fallback
      setUsingFallback(false);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [contentLoading, contentError, content, usingFallback]);
  
  // Handle content loading tasks and preload assets
  useEffect(() => {
    if (contentLoading && !usingFallback) {
      addLoadingTask('hero-content');
    } else {
      removeLoadingTask('hero-content');
    }
    
    if (contentError) {
      setVideoError(`Content loading error: ${contentError.message}`);
    } else {
      setVideoError(null);
    }

    // Preload hero assets when content is available
    if (content && !contentLoading && !contentError) {
      preloadHeroAssets(content).catch(error => {
        console.warn('Failed to preload hero assets:', error);
      });
    }
  }, [contentLoading, contentError, content, addLoadingTask, removeLoadingTask]);
  
  // Cleanup loading tasks on unmount
  useEffect(() => {
    return () => {
      // Use setTimeout to ensure cleanup happens after all other operations
      setTimeout(() => {
        removeLoadingTask('hero-content');
        removeLoadingTask('hero-video');  
        removeLoadingTask('hero-background-image');
      }, 0);
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // Handle video URL changes
  useEffect(() => {
    // Use fallback content if available, otherwise use regular content or defaults
    const activeContent = usingFallback ? fallbackContent : (content || DEFAULT_CONTENT_VALUES);
    const backgroundVideo = getContentValue(activeContent, 'hero_background_video', 
      usingFallback ? FALLBACK_CONTENT.hero_background_video : DEFAULT_CONTENT_VALUES['hero_background_video']);
    
    if (backgroundVideo && backgroundVideo !== currentVideoUrl) {
      // Skip invalid URLs
      if (backgroundVideo.includes('\\') || backgroundVideo.startsWith('file://') || backgroundVideo.includes('src/')) {
        const warningMsg = `Skipping invalid video URL: ${backgroundVideo}`;
        setVideoError(warningMsg);
        return;
      }
      
      let validVideoUrl = backgroundVideo;
      
      // Handle different URL types
      if (backgroundVideo.startsWith('data:') || 
          backgroundVideo.startsWith('/api/media/') || 
          backgroundVideo.startsWith('http') || 
          backgroundVideo.startsWith('/videos/')) {
        validVideoUrl = backgroundVideo;
      } else if (!backgroundVideo.startsWith('/')) {
        validVideoUrl = `/videos/${backgroundVideo}`;
      }
      
      setCurrentVideoUrl(validVideoUrl);
      setVideoError(null);
      setVideoTaskAdded(false);
    }
  }, [content, fallbackContent, usingFallback, currentVideoUrl]);
  
  // Get content values
  const title = t('hero_title');
  const subtitle = t('hero_subtitle');
  // Use fallback content if available, otherwise use regular content or defaults
  const safeContent = usingFallback ? fallbackContent : (content || DEFAULT_CONTENT_VALUES);
  const description = getContentValue(safeContent, 'hero_description', t('hero_description'));
  const backgroundImage = getContentValue(safeContent, 'hero_background_image', DEFAULT_CONTENT_VALUES['hero_background_image'] || '');

  return (
    <section ref={sectionRef} className="relative h-[500px] md:h-[600px] flex items-center justify-center text-white overflow-hidden">
      {/* Background Images and Videos - Layered setup */}
      <div className="absolute inset-0 z-0">
        {/* Debug info */}
        <div className="absolute top-4 left-4 z-50 bg-black/80 text-white p-2 text-xs">
          <div>Video: {currentVideoUrl || 'None'}</div>
          <div>Image: {backgroundImage || 'None'}</div>
          <div>Error: {videoError || 'None'}</div>
          <div>From Cache: {fromCache ? 'Yes' : 'No'}</div>
          <div>SW: {swRegistered ? 'Yes' : 'No'}</div>
        </div>
        {/* Background Image - Cached */}
        {backgroundImage && !currentVideoUrl && (
          <CachedImage
            src={backgroundImage}
            alt="Hero background image"
            fill
            sizes="100vw"
            className="object-cover"
            priority={true}
            onLoadStart={() => addLoadingTask('hero-background-image')}
            onLoad={() => removeLoadingTask('hero-background-image')}
            onError={() => removeLoadingTask('hero-background-image')}
          />
        )}
        
        {/* Background Video - Direct loading for UploadThing URLs to avoid CORS */}
        {currentVideoUrl && !videoError && (
          <video
            ref={videoRef}
            src={currentVideoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            poster={backgroundImage}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            onLoadStart={() => {
              console.log('🎬 Hero video loading started (direct)');
              if (!videoTaskAdded) {
                setIsVideoLoading(true);
                addLoadingTask('hero-video');
                setVideoTaskAdded(true);
              }
            }}
            onCanPlay={() => {
              console.log('🎉 Hero video can play');
              if (videoTaskAdded) {
                setIsVideoLoading(false);
                removeLoadingTask('hero-video');
                setVideoTaskAdded(false);
              }
            }}
            onError={(e) => {
              console.error('❌ Hero video failed:', e);
              setVideoError('Video failed to load');
              if (videoTaskAdded) {
                setIsVideoLoading(false);
                removeLoadingTask('hero-video');
                setVideoTaskAdded(false);
              }
            }}
          />
        )}
        
        {/* Light text shadow for readability - no overlay needed */}
      </div>
      
      {/* Fallback gradient background (shown if no video and no image) */}
      {!backgroundImage && (!currentVideoUrl || videoError) && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600" />
      )}
      

      
      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          {title}
        </h1>
        
        <h2 className="text-xl md:text-2xl font-medium mb-6 text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
          {subtitle}
        </h2>
        
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
          {description}
        </p>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full animate-pulse z-10" />
      <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-white/20 rounded-full animate-pulse delay-1000 z-10" />
      <div className="absolute top-1/2 left-20 w-12 h-12 border-2 border-white/20 rounded-full animate-pulse delay-500 z-10" />
      
    </section>
  );
};

export default HeroSection;
