'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import { useCachedImage, useCachedVideo } from '@/hooks/useMediaCache';
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
  
  // Cached image hook
  const {
    url: cachedImageUrl,
    loading: imageLoading,
    cached: imageCached,
    progress: imageProgress
  } = useCachedImage({
    src: content.backgroundImage || '',
    autoCache: !!content.backgroundImage,
    quality: 90,
    format: 'auto',
    preload: true
  });
  
  // Cached video hook
  const {
    url: cachedVideoUrl,
    loading: videoLoading,
    cached: videoCached,
    progress: videoProgress
  } = useCachedVideo({
    src: content.backgroundVideo || '',
    autoCache: !!content.backgroundVideo,
    preload: true
  });
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
          // Always use translations for text content, only use API for media
          setContent({
            title: t('hero_title'),
            subtitle: t('hero_subtitle'),
            description: t('hero_description'),
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
        } else {
          // If API fails, use translations
          setContent({
            title: t('hero_title'),
            subtitle: t('hero_subtitle'),
            description: t('hero_description'),
            backgroundImage: undefined,
            backgroundVideo: undefined
          });
        }
      } catch (error) {
        console.error('❌ Hero: Error fetching content:', error);
        // If API fails, use translations
        setContent({
          title: t('hero_title'),
          subtitle: t('hero_subtitle'),
          description: t('hero_description'),
          backgroundImage: undefined,
          backgroundVideo: undefined
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [t]);

  return (
    <section className="relative h-screen min-h-[700px] max-h-[900px] flex items-center justify-center text-white overflow-hidden">
      {/* Background Images and Videos */}
      <div className="absolute inset-0 z-0">
        {cachedImageUrl && !content.backgroundVideo && !loading && (
          <>
            <Image
              src={cachedImageUrl}
              alt="Hero background image"
              fill
              sizes="100vw"
              className="object-cover brightness-75"
              priority={true}
              quality={90}
              unoptimized={content.backgroundImage?.startsWith('data:')}
            />
            {imageCached && (
              <div className="absolute top-4 right-4 z-50 bg-green-500/80 text-white px-2 py-1 text-xs rounded">
                📦 Cached Image
              </div>
            )}
            {imageLoading && imageProgress && (
              <div className="absolute top-4 right-4 z-50 bg-blue-500/80 text-white px-2 py-1 text-xs rounded">
                📥 Loading: {imageProgress.percentage}%
              </div>
            )}
          </>
        )}
        
        {cachedVideoUrl && !loading && (
          <>
            <video
              ref={videoRef}
              src={cachedVideoUrl}
              className="absolute inset-0 w-full h-full object-cover brightness-75"
              poster={cachedImageUrl || content.backgroundImage}
              muted
              autoPlay
              loop
              playsInline
              preload="auto"
              onLoadedData={() => {
                console.log('📹 Hero video data loaded from cache/UploadThing');
                if (videoRef.current) {
                  videoRef.current.play().catch(console.warn);
                }
              }}
              onPlaying={() => {
                console.log(`🎉 Hero video playing ${videoCached ? 'from cache' : 'from CDN'}`);
              }}
              onError={(e) => {
                console.error('❌ Hero video failed to load:', e);
              }}
            />
            {videoCached && (
              <div className="absolute top-4 left-4 z-50 bg-green-500/80 text-white px-2 py-1 text-xs rounded">
                📦 Cached Video
              </div>
            )}
            {videoLoading && videoProgress && (
              <div className="absolute top-4 left-4 z-50 bg-blue-500/80 text-white px-2 py-1 text-xs rounded">
                📥 Loading: {videoProgress.percentage}%
              </div>
            )}
          </>
        )}
      </div>
      
      {!cachedImageUrl && !cachedVideoUrl && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600" />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
      
      {/* Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 md:px-8 text-center">
        <p className="text-[14px] uppercase tracking-[0.2em] font-semibold text-white/90 mb-6 animate-fade-in">
          {t('hero_eyebrow') || 'Spring 2025 Collection'}
        </p>
        
        <h1 className="font-lora text-[clamp(48px,6vw,80px)] font-bold leading-[1.1] mb-8 text-white animate-fade-in-up" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.4)' }}>
          {content.title}
        </h1>
        
        <p className="text-[clamp(18px,2vw,24px)] leading-relaxed mb-12 max-w-3xl mx-auto text-white/90 animate-fade-in-up animation-delay-200" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.3)' }}>
          {content.subtitle}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
          <a 
            href="/search/all-products" 
            className="w-full sm:w-auto px-10 py-5 bg-white text-veryDarkPurple font-bold text-[18px] rounded-full hover:bg-white/90 hover:scale-105 transition-all duration-300 shadow-xl"
          >
            {t('hero_cta_primary') || 'Shop New Arrivals'}
          </a>
          <a 
            href="/products" 
            className="w-full sm:w-auto px-10 py-5 border-2 border-white text-white font-bold text-[18px] rounded-full hover:bg-white/10 transition-all duration-300"
          >
            {t('hero_cta_secondary') || 'View All Products'}
          </a>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/70 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
