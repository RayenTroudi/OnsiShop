'use client';

import { DEFAULT_CONTENT_VALUES, getContentValue } from '@/lib/content';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const HeroSection = () => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        const result = await response.json();
        if (result.success) {
          setContent(result.data || {});
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);
  
  const title = getContentValue(content, 'hero.title', DEFAULT_CONTENT_VALUES['hero.title']);
  const subtitle = getContentValue(content, 'hero.subtitle', DEFAULT_CONTENT_VALUES['hero.subtitle']);
  const description = getContentValue(content, 'hero.description', DEFAULT_CONTENT_VALUES['hero.description']);
  const buttonText = getContentValue(content, 'hero.buttonText', DEFAULT_CONTENT_VALUES['hero.buttonText']);
  const backgroundVideo = getContentValue(content, 'hero.backgroundVideo', DEFAULT_CONTENT_VALUES['hero.backgroundVideo']);

  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center justify-center text-white overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide video if it fails to load
            const video = e.target as HTMLVideoElement;
            video.style.display = 'none';
          }}
        >
          <source src={backgroundVideo} type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
        </video>
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
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            href="/search" 
            className="bg-white text-purple-900 px-8 py-3 rounded-full font-semibold text-lg hover:bg-purple-50 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {buttonText}
          </Link>
          
          <Link 
            href="/about-us" 
            className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-white hover:text-purple-900 transition-colors duration-300"
          >
            Learn More
          </Link>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/20 rounded-full animate-pulse z-10" />
      <div className="absolute bottom-20 right-20 w-16 h-16 border-2 border-white/20 rounded-full animate-pulse delay-1000 z-10" />
      <div className="absolute top-1/2 left-20 w-12 h-12 border-2 border-white/20 rounded-full animate-pulse delay-500 z-10" />
    </section>
  );
};

export default HeroSection;
