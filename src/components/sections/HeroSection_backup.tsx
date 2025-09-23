'use client';

import { useLoading } from '@/contexts/LoadingContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { DEFAULT_CONTENT_VALUES, getContentValue } from '@/lib/content-manager';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

const HeroSection = () => {
  const { t } = useTranslation();
  const { addLoadingTask, removeLoadingTask } = useLoading();
  const [content, setContent] = useState<Record<string, string>>(DEFAULT_CONTENT_VALUES);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const [videoTaskAdded, setVideoTaskAdded] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const videoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  

  
  const fetchContent = useCallback(async () => {
    addLoadingTask('hero-content');
    try {
      const response = await fetch('/api/content', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const result = await response.json();
      if (result.success) {
        setContent(result.data || {});
        setVideoError(null);
        setIsContentLoaded(true);
      }
      removeLoadingTask('hero-content');
    } catch (error) {
      const errorMsg = `Error fetching content: ${error}`;
      console.error(errorMsg);
      setVideoError(errorMsg);
      removeLoadingTask('hero-content');
    }
  }, [addLoadingTask, removeLoadingTask]);



  useEffect(() => {
    fetchContent();
  }, []); // Empty dependency array - only run once on mount
  
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
    // Use normalized key lookup for background video
    const backgroundVideo = getContentValue(content, 'hero_background_video', DEFAULT_CONTENT_VALUES['hero_background_video']);
    
    // Validate video URL
    if (backgroundVideo && backgroundVideo !== currentVideoUrl) {
      // Skip if the URL looks like a local file path (VS Code development issue)
      if (backgroundVideo.includes('\\') || backgroundVideo.startsWith('file://') || backgroundVideo.includes('src/')) {
        const warningMsg = `Skipping invalid video URL that looks like local path: ${backgroundVideo}`;
        setVideoError(warningMsg);
        return;
      }
      
      // Handle different types of video URLs
      let validVideoUrl = backgroundVideo;
      
      // If it's a base64 data URL, use it directly
      if (backgroundVideo.startsWith('data:')) {
        validVideoUrl = backgroundVideo;
      }
      // If it's a database media ID route, use it directly
      else if (backgroundVideo.startsWith('/api/media/')) {
        validVideoUrl = backgroundVideo;
      }
      // If it's an external URL, use it directly
      else if (backgroundVideo.startsWith('http')) {
        validVideoUrl = backgroundVideo;
      }
      // If it's a relative path to public folder
      else if (backgroundVideo.startsWith('/videos/')) {
        validVideoUrl = backgroundVideo;
      }
      // If it's just a filename, assume it's in videos folder
      else if (!backgroundVideo.startsWith('/')) {
        validVideoUrl = `/videos/${backgroundVideo}`;
      }
      
      // Set the video URL
      setCurrentVideoUrl(validVideoUrl);
      setVideoError(null); // Reset error state
      setVideoTaskAdded(false); // Reset video task state for new video
    }
  }, [content, currentVideoUrl]);
  
  // Use translations for text content, content management for media
  const title = t('hero_title');
  const subtitle = t('hero_subtitle');
  const description = getContentValue(content, 'hero_description', t('hero_description')); // Fallback to translation if no custom description
  const backgroundImage = getContentValue(content, 'hero_background_image', DEFAULT_CONTENT_VALUES['hero_background_image'] || '');

  return (
    <section ref={sectionRef} className="relative h-[500px] md:h-[600px] flex items-center justify-center text-white overflow-hidden">
      {/* Background Images and Videos - Layered setup */}
      <div className="absolute inset-0 z-0">
        {/* Background Image Layer (fallback when no video or video fails) */}
        {backgroundImage && !currentVideoUrl && (
          <>
            <Image
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
          </>
        )}
        
        {/* Background Video - Priority Loading */}
        {currentVideoUrl && !videoError && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={currentVideoUrl}
            poster={backgroundImage}
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            onLoadStart={() => {
              if (!videoTaskAdded) {
                console.log('🎬 Hero video loading started');
                setIsVideoLoading(true);
                addLoadingTask('hero-video');
                setVideoTaskAdded(true);
                
                // Set a timeout to prevent infinite loading (10 seconds max)
                videoTimeoutRef.current = setTimeout(() => {
                  console.warn('⚠️ Hero video loading timeout - removing loading task');
                  if (videoTaskAdded) {
                    setIsVideoLoading(false);
                    removeLoadingTask('hero-video');
                    setVideoTaskAdded(false);
                  }
                }, 10000); // 10 second timeout
              }
            }}
            onCanPlay={() => {
              console.log('🎬 Hero video can start playing');
            }}
            onCanPlayThrough={() => {
              if (videoTaskAdded) {
                console.log('� Hero video fully loaded and ready to play smoothly');
                setIsVideoLoading(false);
                removeLoadingTask('hero-video');
                setVideoTaskAdded(false);
              }
            }}
            onLoadedData={() => {
              console.log('🎬 Hero video data loaded');
            }}
            onCanPlayThrough={() => {
              if (videoTaskAdded) {
                console.log('🎉 Hero video fully loaded and ready to play smoothly');
                setIsVideoLoading(false);
                removeLoadingTask('hero-video');
                setVideoTaskAdded(false);
                
                // Clear timeout since video loaded successfully
                if (videoTimeoutRef.current) {
                  clearTimeout(videoTimeoutRef.current);
                  videoTimeoutRef.current = null;
                }
              }
            }}
            onError={(e) => {
              if (videoTaskAdded) {
                console.error('❌ Hero video failed to load:', e);
                setVideoError('Video failed to load');
                setIsVideoLoading(false);
                removeLoadingTask('hero-video');
                setVideoTaskAdded(false);
                
                // Clear timeout since video failed
                if (videoTimeoutRef.current) {
                  clearTimeout(videoTimeoutRef.current);
                  videoTimeoutRef.current = null;
                }
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
