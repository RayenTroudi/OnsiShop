'use client';

import { DEFAULT_CONTENT_VALUES, getContentValue } from '@/lib/content-manager';
import { useCallback, useEffect, useRef, useState } from 'react';

// Custom hook for intersection observer lazy loading
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting && !isLoaded) {
        setIsIntersecting(true);
        setIsLoaded(true);
        observer.disconnect();
      }
    }, { threshold: 0.1, rootMargin: '50px', ...options });

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => observer.disconnect();
  }, [isLoaded]);

  return { ref: targetRef, isIntersecting };
};

const HeroSection = () => {
  const [content, setContent] = useState<Record<string, string>>(DEFAULT_CONTENT_VALUES);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  
  // Lazy loading with intersection observer
  const { ref: sectionRef, isIntersecting: shouldLoadMedia } = useIntersectionObserver();
  
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
      // Content loading complete
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
    // Use normalized key lookup for background video
    const backgroundVideo = getContentValue(content, 'hero_background_video', DEFAULT_CONTENT_VALUES['hero_background_video']);
    
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
  
  // Use normalized content keys for consistent access
  const title = getContentValue(content, 'hero_title', DEFAULT_CONTENT_VALUES['hero_title']);
  const subtitle = getContentValue(content, 'hero_subtitle', DEFAULT_CONTENT_VALUES['hero_subtitle']);
  const description = getContentValue(content, 'hero_description', DEFAULT_CONTENT_VALUES['hero_description']);
  const backgroundImage = getContentValue(content, 'hero_background_image', DEFAULT_CONTENT_VALUES['hero_background_image'] || '');

  return (
    <section ref={sectionRef} className="relative h-[500px] md:h-[600px] flex items-center justify-center text-white overflow-hidden">
      {/* Background Images and Videos - Layered setup */}
      <div className="absolute inset-0 z-0">
        {/* Background Image Layer (fallback when no video or video fails) */}
        {backgroundImage && !currentVideoUrl && (
          <>
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${backgroundImage}')`
              }}
            />
            {/* Hidden img tag for accessibility and SEO */}
            <img 
              src={backgroundImage} 
              alt="Hero background image" 
              className="sr-only" 
              aria-hidden="true"
            />
          </>
        )}
        
        {/* Background Videos - Dual video setup for smooth transitions */}
        {/* Main video - lazy loaded */}
        {shouldLoadMedia && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="none" // Lazy load - only load when needed
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
        )}
        
        {/* Transition video (hidden, used for smooth transitions) - lazy loaded */}
        {shouldLoadMedia && (
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
        )}
        
        {/* Simple loading overlay - minimal and fast */}
        {isVideoLoading && (
          <div className="absolute inset-0 bg-black/10 z-10" />
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
