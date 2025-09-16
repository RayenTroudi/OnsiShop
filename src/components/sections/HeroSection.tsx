'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import { DEFAULT_CONTENT_VALUES, getContentValue } from '@/lib/content';
import { useCallback, useEffect, useRef, useState } from 'react';

const HeroSection = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  
  // Debug logging helper (disabled)
  const addDebugLog = useCallback((message: string) => {
    // Debug logging disabled
  }, []);
  
  const fetchContent = useCallback(async () => {
    try {
      addDebugLog('Fetching content...');
      const response = await fetch('/api/content', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const result = await response.json();
      if (result.success) {
        addDebugLog('Content updated successfully');
        setContent(result.data || {});
        setVideoError(null);
      }
    } catch (error) {
      const errorMsg = `Error fetching content: ${error}`;
      console.error(errorMsg);
      addDebugLog(errorMsg);
      setVideoError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [addDebugLog]);

  // Smooth video transition function
  const transitionToNewVideo = useCallback((newVideoUrl: string) => {
    if (!videoRef.current || !nextVideoRef.current || newVideoUrl === currentVideoUrl) {
      return;
    }

    addDebugLog(`Starting video transition to: ${newVideoUrl}`);
    setIsVideoLoading(true);
    setVideoError(null);
    
    const nextVideo = nextVideoRef.current;
    const currentVideo = videoRef.current;
    
    // Clear any existing event listeners
    nextVideo.removeEventListener('canplay', null as any);
    nextVideo.removeEventListener('error', null as any);
    
    // Set up error handling for the new video
    const handleError = (e: Event) => {
      const errorMsg = `Failed to load new video: ${newVideoUrl}`;
      addDebugLog(errorMsg);
      setVideoError(errorMsg);
      setIsVideoLoading(false);
      // Keep using current video if new one fails
    };
    
    // Set up success handling
    const handleCanPlay = () => {
      addDebugLog('New video ready, starting transition');
      
      // Remove event listeners to prevent multiple calls
      nextVideo.removeEventListener('canplay', handleCanPlay);
      nextVideo.removeEventListener('error', handleError);
      
      // Start playing new video
      nextVideo.play().then(() => {
        // Smooth transition
        nextVideo.style.opacity = '1';
        currentVideo.style.opacity = '0';
        
        // After transition, swap videos and cleanup
        setTimeout(() => {
          // Update the main video source
          currentVideo.src = newVideoUrl;
          currentVideo.load(); // Force reload
          
          // Wait for main video to be ready
          const handleMainVideoReady = () => {
            currentVideo.style.opacity = '1';
            nextVideo.style.opacity = '0';
            currentVideo.play();
            setCurrentVideoUrl(newVideoUrl);
            setIsVideoLoading(false);
            addDebugLog('Video transition complete');
            
            // Cleanup
            currentVideo.removeEventListener('canplay', handleMainVideoReady);
          };
          
          currentVideo.addEventListener('canplay', handleMainVideoReady, { once: true });
        }, 500); // Match CSS transition duration
      }).catch((error) => {
        const errorMsg = `Video play failed: ${error}`;
        addDebugLog(errorMsg);
        setVideoError(errorMsg);
        setIsVideoLoading(false);
      });
    };

    // Add event listeners
    nextVideo.addEventListener('canplay', handleCanPlay, { once: true });
    nextVideo.addEventListener('error', handleError, { once: true });
    
    // Start loading the new video
    nextVideo.src = newVideoUrl;
    nextVideo.load();
    
    // Timeout fallback to prevent infinite loading
    setTimeout(() => {
      if (isVideoLoading) {
        addDebugLog('Video loading timeout, falling back');
        setIsVideoLoading(false);
      }
    }, 10000); // 10 second timeout
    
  }, [currentVideoUrl, isVideoLoading, addDebugLog]);

  useEffect(() => {
    fetchContent();

    // Use Server-Sent Events for real-time updates (better than polling)
    let eventSource: EventSource | null = null;
    
    try {
      eventSource = new EventSource('/api/content/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'content-update') {
            setContent(data.content);
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };
      
      eventSource.onerror = () => {
        console.log('SSE connection error, falling back to manual refresh');
      };
    } catch (error) {
      console.log('SSE not supported, using focus-based updates only');
    }

    // Fallback: refresh on focus (but don't poll continuously)
    const handleFocus = () => {
      fetchContent();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fetchContent]);

  // Handle video URL changes
  useEffect(() => {
    const backgroundVideo = getContentValue(content, 'hero.backgroundVideo', DEFAULT_CONTENT_VALUES['hero.backgroundVideo']);
    
    // Validate video URL
    if (backgroundVideo && backgroundVideo !== currentVideoUrl) {
      // Skip if the URL looks like a local file path (VS Code development issue)
      if (backgroundVideo.includes('\\') || backgroundVideo.startsWith('file://') || backgroundVideo.includes('src/')) {
        const warningMsg = `Skipping invalid video URL that looks like local path: ${backgroundVideo}`;
        addDebugLog(warningMsg);
        setVideoError(warningMsg);
        return;
      }
      
      // Handle different types of video URLs
      let validVideoUrl = backgroundVideo;
      
      // If it's a database media ID route, use it directly
      if (backgroundVideo.startsWith('/api/media/')) {
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
      
      addDebugLog(`Video URL change detected: ${currentVideoUrl} -> ${validVideoUrl}`);
      
      if (currentVideoUrl === '') {
        // Initial load
        addDebugLog('Initial video load');
        setCurrentVideoUrl(validVideoUrl);
      } else {
        // Smooth transition to new video
        addDebugLog('Transitioning to new video');
        transitionToNewVideo(validVideoUrl);
      }
    }
  }, [content, currentVideoUrl, transitionToNewVideo, addDebugLog]);
  
  const title = getContentValue(content, 'hero.title', DEFAULT_CONTENT_VALUES['hero.title']);
  const subtitle = getContentValue(content, 'hero.subtitle', DEFAULT_CONTENT_VALUES['hero.subtitle']);
  const description = getContentValue(content, 'hero.description', DEFAULT_CONTENT_VALUES['hero.description']);
  const backgroundImage = getContentValue(content, 'hero.backgroundImage', DEFAULT_CONTENT_VALUES['hero.backgroundImage'] || '');

  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center justify-center text-white overflow-hidden">
      {/* Background Images and Videos - Layered setup */}
      <div className="absolute inset-0 z-0">
        {/* Background Image Layer (fallback when no video or video fails) */}
        {backgroundImage && (
          <>
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-500"
              style={{
                backgroundImage: `url('${backgroundImage}')`,
                opacity: currentVideoUrl && !videoError ? 0.3 : 1 // Dim when video is playing, full opacity when no video
              }}
            />
            {/* Hidden img tag for accessibility and SEO */}
            <img 
              src={backgroundImage} 
              alt={t('hero_alt_text')} 
              className="sr-only" 
              aria-hidden="true"
            />
          </>
        )}
        
        {/* Background Videos - Dual video setup for smooth transitions */}
        {/* Main video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata" // Changed from "auto" to reduce bandwidth
          className="w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: currentVideoUrl && !videoError ? 1 : 0 }}
          src={currentVideoUrl || undefined}
          onLoadStart={() => {
            addDebugLog('Main video loading started');
            setIsVideoLoading(true);
          }}
          onCanPlay={() => {
            addDebugLog('Main video ready');
            setIsVideoLoading(false);
          }}
          onError={(e) => {
            const errorMsg = `Main video load error: ${currentVideoUrl}`;
            addDebugLog(errorMsg);
            setVideoError(errorMsg);
            setIsVideoLoading(false);
          }}
          onLoadedData={() => {
            addDebugLog('Main video data loaded');
          }}
        />
        
        {/* Transition video (hidden, used for smooth transitions) */}
        <video
          ref={nextVideoRef}
          muted
          loop
          playsInline
          preload="none" // Only load when needed
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none"
          style={{ opacity: 0 }}
          onError={(e) => {
            addDebugLog('Transition video error');
          }}
        />
        
        {/* Loading overlay */}
        {isVideoLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-white text-sm">{t('loading_video')}</p>
            </div>
          </div>
        )}
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Fallback gradient background (shown if no video and no image) */}
      {!backgroundImage && (!currentVideoUrl || videoError) && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600" />
      )}
      
      {/* Background Pattern */}
      <div className="absolute inset-0 z-10 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent drop-shadow-lg">
          {t('hero_title')}
        </h1>
        
        <h2 className="text-xl md:text-2xl font-medium mb-6 text-purple-100 drop-shadow-md">
          {t('hero_subtitle')}
        </h2>
        
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-white/90 drop-shadow-md">
          {t('hero_description')}
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
