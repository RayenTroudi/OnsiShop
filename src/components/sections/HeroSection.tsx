'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  backgroundImage?: string;
  backgroundVideo?: string;
}

const HeroSection = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState<HeroContent>({
    title: 'Welcome to Our Clothing Store',
    subtitle: 'Discover the latest fashion trends and styles',
    description: 'Shop our collection of high-quality clothing for men and women. From casual wear to formal attire, we have everything you need to look your best.'
  });
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Direct fetch content from UploadThing
  useEffect(() => {
    const fetchContent = async () => {
      console.log('🎯 Hero: Direct UploadThing fetch from API');
      
      try {
        const response = await fetch('/api/content', {
          cache: 'no-store'
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setContent({
            title: result.data.hero_title || t('hero_title'),
            subtitle: result.data.hero_subtitle || t('hero_subtitle'),
            description: result.data.hero_description || t('hero_description'),
            backgroundImage: result.data.hero_background_image,
            backgroundVideo: result.data.hero_background_video
          });
          
          console.log('✅ Hero: UploadThing content loaded');
          console.log('   Background Image:', result.data.hero_background_image ? 
            (result.data.hero_background_image.startsWith('data:') ? 
              `Base64 (${(result.data.hero_background_image.length / 1024).toFixed(0)}KB)` : 
              result.data.hero_background_image) : 
            'None');
          console.log('   Background Video:', result.data.hero_background_video || 'None');
        }
      } catch (error) {
        console.error('❌ Hero: Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [t]);

  return (
    <section className="relative h-[500px] md:h-[600px] flex items-center justify-center text-white overflow-hidden">
      {/* Background Images and Videos - Direct UploadThing loading */}
      <div className="absolute inset-0 z-0">
        
        {/* Background Image - Direct UploadThing */}
        {content.backgroundImage && !content.backgroundVideo && !loading && (
          <Image
            src={content.backgroundImage}
            alt="Hero background image"
            fill
            sizes="100vw"
            className="object-cover"
            priority={true}
            quality={90}
            unoptimized={content.backgroundImage.startsWith('data:')}
          />
        )}
        
        {/* Background Video - Direct UploadThing loading */}
        {content.backgroundVideo && !loading && (
          <video
            ref={videoRef}
            src={content.backgroundVideo}
            className="absolute inset-0 w-full h-full object-cover"
            poster={content.backgroundImage}
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            onLoadedData={() => {
              console.log('📹 Hero video data loaded from UploadThing');
              if (videoRef.current) {
                videoRef.current.play().catch(console.warn);
              }
            }}
            onPlaying={() => {
              console.log('🎉 Hero video is playing from UploadThing CDN');
            }}
            onError={(e) => {
              console.error('❌ Hero video failed to load:', e);
            }}
          />
        )}
      </div>
      
      {/* Fallback gradient background */}
      {!content.backgroundImage && !content.backgroundVideo && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600" />
      )}
      
      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          {content.title}
        </h1>
        
        <h2 className="text-xl md:text-2xl font-medium mb-6 text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
          {content.subtitle}
        </h2>
        
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed text-white" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
          {content.description}
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
