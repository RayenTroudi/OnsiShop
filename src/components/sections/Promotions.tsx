'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
// next
import Image from 'next/image';
// contexts
import { useLoading } from '@/contexts/LoadingContext';

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
  const { addLoadingTask, removeLoadingTask } = useLoading();
  const [content, setContent] = useState<PromotionContent>({
    backgroundImage: '',
    buttonLink: '/search/winter-2024',
    title: 'Winter Collection Now Available',
    subtitle: 'Stay cozy and fashionable this winter with our new collection!',
    buttonText: 'View Collection'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hasRegisteredContentTask, setHasRegisteredContentTask] = useState(false);
  const [hasRegisteredImageTask, setHasRegisteredImageTask] = useState(false);
  const isMountedRef = useRef(true);

  const fetchContent = useCallback(async () => {
    console.log('🎯 Promotions: Fetching real content from API');
    setImageError(false);
    
    if (!hasRegisteredContentTask) {
      addLoadingTask('promotions-content');
      setHasRegisteredContentTask(true);
    }
    
    try {
      const response = await fetch('/api/content', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      const result = await response.json();
      
      if (!isMountedRef.current) return;
      
      if (result.success && result.data) {
        const promotionContent = {
          backgroundImage: result.data.promotion_background_image || '',
          buttonLink: result.data.promotion_button_link || '/search/winter-2024',
          title: result.data.promotion_title || 'Winter Collection Now Available',
          subtitle: result.data.promotion_subtitle || 'Stay cozy and fashionable this winter with our new collection!',
          buttonText: result.data.promotion_button_text || 'View Collection'
        };
        
        console.log('✅ Promotions: Using real content');
        console.log('   Background Image:', promotionContent.backgroundImage ? 
          (promotionContent.backgroundImage.startsWith('data:') ? 
            `Base64 image (${(promotionContent.backgroundImage.length / 1024).toFixed(0)}KB)` : 
            promotionContent.backgroundImage) : 
          'None');
        console.log('   Title:', promotionContent.title);
        console.log('   Subtitle:', promotionContent.subtitle);
        
        setContent(promotionContent);
      } else {
        console.log('⚠️  Promotions: API failed, using fallback content');
        setContent({
          backgroundImage: '',
          buttonLink: '/search/winter-2024',
          title: 'Winter Collection Now Available',
          subtitle: 'Stay cozy and fashionable this winter with our new collection!',
          buttonText: 'View Collection'
        });
      }
    } catch (error) {
      console.error('❌ Promotions: Error fetching content:', error);
      if (!isMountedRef.current) return;
      
      setContent({
        backgroundImage: '',
        buttonLink: '/search/winter-2024',
        title: 'Winter Collection Now Available',
        subtitle: 'Stay cozy and fashionable this winter with our new collection!',
        buttonText: 'View Collection'
      });
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        removeLoadingTask('promotions-content');
      }
    }
  }, [addLoadingTask, removeLoadingTask, hasRegisteredContentTask]);

  useEffect(() => {
    fetchContent();
    
    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      // Defensive cleanup with timeout
      setTimeout(() => {
        removeLoadingTask('promotions-content');
        removeLoadingTask('promotion-image');
      }, 0);
    };
  }, [fetchContent, removeLoadingTask]);

  return (
    <ParallaxProvider>
      <div className="relative h-[570px] overflow-hidden sm:h-screen">
        <h2 className="sr-only">Promotions</h2>
        
        {/* Simple loading state */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100/80 z-10" />
        )}
        

        
        {/* Images with Priority Loading */}
        {!isLoading && content.backgroundImage && (
          <>
            <Parallax speed={-50} className="relative hidden h-full w-full sm:block">
              <Image
                key={content.backgroundImage}
                src={content.backgroundImage}
                alt="promotion background"
                fill
                sizes="(min-width: 768px) 100vw, 867px"
                className="object-cover transition-opacity duration-300"
                priority={true}
                unoptimized={content.backgroundImage.includes('/uploads/') || content.backgroundImage.startsWith('data:')}
                onError={() => {
                  setImageError(true);
                  if (hasRegisteredImageTask) {
                    removeLoadingTask('promotion-image');
                    setHasRegisteredImageTask(false);
                  }
                }}
                onLoad={() => {
                  setImageError(false);
                  if (hasRegisteredImageTask) {
                    removeLoadingTask('promotion-image');
                    setHasRegisteredImageTask(false);
                  }
                }}
                onLoadStart={() => {
                  if (!hasRegisteredImageTask) {
                    addLoadingTask('promotion-image');
                    setHasRegisteredImageTask(true);
                  }
                }}
              />
            </Parallax>
            <div className="relative block h-full w-full sm:hidden">
              <Image
                key={content.backgroundImage}
                src={content.backgroundImage}
                alt="promotion background"
                fill
                sizes="(max-width: 767px) 100vw, 867px"
                className="object-cover transition-opacity duration-300"
                priority={true}
                unoptimized={content.backgroundImage.includes('/uploads/') || content.backgroundImage.startsWith('data:')}
                onError={() => {
                  setImageError(true);
                  if (hasRegisteredImageTask) {
                    removeLoadingTask('promotion-image');
                    setHasRegisteredImageTask(false);
                  }
                }}
                onLoad={() => {
                  setImageError(false);
                  if (hasRegisteredImageTask) {
                    removeLoadingTask('promotion-image');
                    setHasRegisteredImageTask(false);
                  }
                }}
                onLoadStart={() => {
                  if (!hasRegisteredImageTask) {
                    addLoadingTask('promotion-image');
                    setHasRegisteredImageTask(true);
                  }
                }}
              />
            </div>
          </>
        )}
        <div className="absolute right-[5%] top-[50%] flex w-[65%] max-w-[610px] flex-col items-center justify-center gap-[16px] rounded-[16px] bg-white/30 p-[16px] text-center -translate-y-1/2 md:gap-[32px] md:p-[32px]">
          <h3 className="font-lora text-[clamp(24px,14px_+_2vw,60px)] font-bold leading-[1.5] text-white drop-shadow-md">
            {content.title.split('\n').map((line: string, i: number) => (
              <span key={i}>
                {line}
                {i < content.title.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h3>
          <p className="text-[clamp(18px,10px_+_2vw,32px)] font-semibold text-veryDarkPurple drop-shadow-md">
            {content.subtitle}
          </p>
          <a className="btn text-[clamp(16px,8px_+_2vw,22px)]" href={content.buttonLink}>
            {content.buttonText}
          </a>
        </div>
      </div>
    </ParallaxProvider>
  );
};

export default Promotions;
