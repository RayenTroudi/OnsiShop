'use client';

import { DEFAULT_CONTENT_VALUES, getContentValue } from '@/lib/content';
import { useCallback, useEffect, useRef, useState } from 'react';

const HeroSection = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  
  const fetchContent = useCallback(async () => {
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
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Smooth video transition function
  const transitionToNewVideo = useCallback((newVideoUrl: string) => {
    if (!videoRef.current || !nextVideoRef.current || newVideoUrl === currentVideoUrl) {
      return;
    }

    setIsVideoLoading(true);
    
    // Preload new video
    nextVideoRef.current.src = newVideoUrl;
    nextVideoRef.current.load();
    
    // Wait for new video to be ready
    const handleCanPlay = () => {
      const nextVideo = nextVideoRef.current;
      const currentVideo = videoRef.current;
      
      if (nextVideo && currentVideo) {
        // Start playing new video
        nextVideo.play().then(() => {
          // Smooth transition
          nextVideo.style.opacity = '1';
          currentVideo.style.opacity = '0';
          
          // After transition, swap videos
          setTimeout(() => {
            if (currentVideo && nextVideo) {
              currentVideo.src = newVideoUrl;
              currentVideo.style.opacity = '1';
              nextVideo.style.opacity = '0';
              currentVideo.play();
              setCurrentVideoUrl(newVideoUrl);
              setIsVideoLoading(false);
            }
          }, 500); // Match CSS transition duration
        }).catch(console.error);
      }
    };

    nextVideoRef.current.addEventListener('canplay', handleCanPlay, { once: true });
  }, [currentVideoUrl]);

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
    
    if (backgroundVideo && backgroundVideo !== currentVideoUrl) {
      if (currentVideoUrl === '') {
        // Initial load
        setCurrentVideoUrl(backgroundVideo);
      } else {
        // Smooth transition to new video
        transitionToNewVideo(backgroundVideo);
      }
    }
  }, [content, currentVideoUrl, transitionToNewVideo]);
  
  const title = getContentValue(content, 'hero.title', DEFAULT_CONTENT_VALUES['hero.title']);
  const subtitle = getContentValue(content, 'hero.subtitle', DEFAULT_CONTENT_VALUES['hero.subtitle']);
  const description = getContentValue(content, 'hero.description', DEFAULT_CONTENT_VALUES['hero.description']);

  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center justify-center text-white overflow-hidden">
      {/* Background Videos - Dual video setup for smooth transitions */}
      <div className="absolute inset-0 z-0">
        {/* Main video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: currentVideoUrl ? 1 : 0 }}
          src={currentVideoUrl}
          onLoadStart={() => setIsVideoLoading(true)}
          onCanPlay={() => setIsVideoLoading(false)}
          onError={(e) => {
            console.error('Video load error:', e);
            setIsVideoLoading(false);
          }}
        />
        
        {/* Transition video (hidden, used for smooth transitions) */}
        <video
          ref={nextVideoRef}
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          style={{ opacity: 0 }}
        />
        
        {/* Loading overlay */}
        {isVideoLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Fallback gradient background (shown if video fails to load) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 z-10 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
      
      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent drop-shadow-lg">
          {title}
        </h1>
        
        <h2 className="text-xl md:text-2xl font-medium mb-6 text-purple-100 drop-shadow-md">
          {subtitle}
        </h2>
        
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-white/90 drop-shadow-md">
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
