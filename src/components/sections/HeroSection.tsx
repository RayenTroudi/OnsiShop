'use client';

import LazyVideo from '@/components/common/LazyVideo';
import { useTranslation } from '@/contexts/TranslationContext';
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
  const { t } = useTranslation();
  const [content, setContent] = useState<Record<string, string>>(DEFAULT_CONTENT_VALUES);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [videoError, setVideoError] = useState<string | null>(null);
  
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
      
      // Set the video URL - LazyVideo component will handle the loading
      addDebugLog(`Setting video URL: ${validVideoUrl}`);
      setCurrentVideoUrl(validVideoUrl);
      setVideoError(null); // Reset error state
    }
  }, [content, currentVideoUrl, addDebugLog]);
  
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
        
        {/* Background Video - Enhanced lazy loading */}
        {currentVideoUrl && !videoError && (
          <LazyVideo
            src={currentVideoUrl}
            poster={backgroundImage}
            className="absolute inset-0"
            muted={true}
            autoPlay={true}
            loop={true}
            playsInline={true}
            threshold={0.1}
            rootMargin="100px"
            onLoadStart={() => {
              addDebugLog('Video loading started');
              setIsVideoLoading(true);
            }}
            onLoadComplete={() => {
              addDebugLog('Video loading completed');
              setIsVideoLoading(false);
            }}
            onError={(error) => {
              addDebugLog(error);
              setVideoError(error);
              setIsVideoLoading(false);
            }}
            loadingComponent={
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-purple-700/80 to-pink-600/80 flex items-center justify-center">
                <div className="bg-black/30 rounded-xl p-6 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                    <div className="text-white">
                      <div className="font-medium">Loading video...</div>
                      <div className="text-sm opacity-80">Preparing your experience</div>
                    </div>
                  </div>
                </div>
              </div>
            }
            fallbackComponent={
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600">
                <div className="absolute inset-0 bg-black/20" />
              </div>
            }
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
