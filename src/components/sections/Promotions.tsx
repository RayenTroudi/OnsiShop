'use client';

import { useEffect, useState } from 'react';
// next
import Image from 'next/image';
// media cache
import { useCachedImage } from '@/hooks/useMediaCache';

// react-scroll-parallax
import { Parallax, ParallaxProvider } from 'react-scroll-parallax';

interface PromotionContent {
  backgroundImage: string;
  buttonLink: string;
  title: string;
  subtitle: string;
  buttonText: string;
}

const Promotions = () => {
  const [content, setContent] = useState<PromotionContent>({
    backgroundImage: '',
    buttonLink: '/search/winter-2024',
    title: 'Winter Collection Now Available',
    subtitle: 'Stay cozy and fashionable this winter with our new collection!',
    buttonText: 'View Collection'
  });
  const [loading, setLoading] = useState(true);
  const [imageReady, setImageReady] = useState(false);
  
  // Cached image hook for background image - only initialize when we have an image URL
  const {
    url: cachedImageUrl,
    loading: imageLoading,
    cached: imageCached,
    progress: imageProgress
  } = useCachedImage({
    src: content.backgroundImage || '/images/placeholder.jpg',
    autoCache: !!content.backgroundImage,
    quality: 90,
    format: 'auto',
    preload: true,
    onLoad: () => setImageReady(true),
    onError: (error) => {
      console.error('Image loading error:', error);
      setImageReady(false);
    }
  });

  useEffect(() => {
    const fetchContent = async () => {
      console.log('🎯 Promotions: Fetching content from API');
      
      try {
        const response = await fetch('/api/content', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        const result = await response.json();
        
        if (result.success && result.data) {
          const promotionContent = {
            backgroundImage: result.data.promotion_background_image || '',
            buttonLink: result.data.promotion_button_link || '/search/winter-2024',
            title: result.data.promotion_title || 'Winter Collection Now Available',
            subtitle: result.data.promotion_subtitle || 'Stay cozy and fashionable this winter with our new collection!',
            buttonText: result.data.promotion_button_text || 'View Collection'
          };
          
          console.log('✅ Promotions: Content loaded successfully');
          console.log('   Background Image:', promotionContent.backgroundImage ? 
            (promotionContent.backgroundImage.startsWith('data:') ? 
              `Base64 image (${(promotionContent.backgroundImage.length / 1024).toFixed(0)}KB)` : 
              promotionContent.backgroundImage) : 
            'None');
          
          setContent(promotionContent);
        } else {
          console.log('⚠️  Promotions: API failed, using fallback content');
        }
      } catch (error) {
        console.error('❌ Promotions: Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <ParallaxProvider>
      <div className="relative h-[600px] md:h-[700px] overflow-hidden">
        <h2 className="sr-only">Promotions</h2>
        
        {cachedImageUrl && (
          <>
            <Parallax speed={-20} className="relative hidden h-full w-full md:block">
              <Image
                src={cachedImageUrl}
                alt="promotion background"
                fill
                sizes="100vw"
                className="object-cover brightness-90"
                priority={true}
                quality={90}
                unoptimized={content.backgroundImage.startsWith('data:')}
              />
              {imageCached && (
                <div className="absolute top-4 right-4 z-50 bg-green-500/80 text-white px-2 py-1 text-xs rounded">
                  📦 Cached
                </div>
              )}
              {imageLoading && imageProgress && (
                <div className="absolute top-4 right-4 z-50 bg-blue-500/80 text-white px-2 py-1 text-xs rounded">
                  📥 {imageProgress.percentage}%
                </div>
              )}
            </Parallax>
            <div className="relative block h-full w-full md:hidden">
              <Image
                src={cachedImageUrl}
                alt="promotion background"
                fill
                sizes="100vw"
                className="object-cover brightness-90"
                priority={true}
                quality={90}
                unoptimized={content.backgroundImage.startsWith('data:')}
              />
              {imageCached && (
                <div className="absolute top-4 right-4 z-50 bg-green-500/80 text-white px-2 py-1 text-xs rounded">
                  📦 Cached
                </div>
              )}
            </div>
          </>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
            <div className="max-w-2xl">
              <h3 className="font-lora text-[clamp(32px,5vw,64px)] font-bold leading-[1.2] text-white mb-6 drop-shadow-2xl">
                {content.title.split('\n').map((line: string, i: number) => (
                  <span key={i}>
                    {line}
                    {i < content.title.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </h3>
              <p className="text-[clamp(18px,2vw,28px)] font-semibold text-white/95 drop-shadow-lg">
                {content.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ParallaxProvider>
  );
};

export default Promotions;
