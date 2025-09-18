'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import { useEffect, useState } from 'react';
// next
import Image from 'next/image';

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
  const { t } = useTranslation();
  const [content, setContent] = useState<PromotionContent>({
    backgroundImage: '/images/placeholder-product.svg',
    buttonLink: '/search/winter-2024',
    title: 'have fun',
    subtitle: 'very nice collection',
    buttonText: 'check'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Load promotion content from database (only background image and link)
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setImageError(false);
        
        // Add cache busting to force fresh data
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/content?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Promotion content loaded:', result.data);
          
          if (result.success && result.data) {
            const newContent = {
              backgroundImage: result.data['promotion_background_image'] || '/images/placeholder-product.svg',
              buttonLink: result.data['promotion_button_link'] || '/search/winter-2024',
              title: result.data['promotion_title'] || 'have fun',
              subtitle: result.data['promotion_subtitle'] || 'very nice collection',
              buttonText: result.data['promotion_button_text'] || 'check'
            };
            
            console.log('Setting promotion content:', newContent);
            setContent(newContent);
          }
        }
      } catch (error) {
        console.error('Error loading promotion content:', error);
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();

    // Set up real-time updates via Server-Sent Events
    const eventSource = new EventSource('/api/content/stream');
    
    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received SSE message:', message);
        
        if (message.type === 'content-update' && message.content) {
          const updatedContent = message.content;
          console.log('Processing content update:', updatedContent);
          
          setImageError(false);
          setContent(prevContent => ({
            backgroundImage: updatedContent['promotion_background_image'] || prevContent.backgroundImage,
            buttonLink: updatedContent['promotion_button_link'] || prevContent.buttonLink,
            title: updatedContent['promotion_title'] || prevContent.title,
            subtitle: updatedContent['promotion_subtitle'] || prevContent.subtitle,
            buttonText: updatedContent['promotion_button_text'] || prevContent.buttonText
          }));
        }
      } catch (error) {
        console.error('Error processing content update:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
    };

    // Cleanup function
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <ParallaxProvider>
      <div className="relative h-[570px] overflow-hidden sm:h-screen">
        <h2 className="sr-only">Promotions</h2>
        
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading promotions...</p>
            </div>
          </div>
        )}
        
        {/* Error State */}
        {imageError && !isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-700 to-pink-600 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Promotions Coming Soon</h3>
              <p className="text-purple-100">We're updating our latest offers</p>
            </div>
          </div>
        )}
        
        {/* Images */}
        {!isLoading && !imageError && (
          <>
            <Parallax speed={-50} className="relative hidden h-full w-full sm:block">
              <Image
                key={content.backgroundImage}
                src={content.backgroundImage}
                alt="promotion background"
                fill
                sizes="(min-width: 768px) 100vw, 867px"
                className="object-cover"
                priority
                unoptimized={content.backgroundImage.includes('/uploads/') || content.backgroundImage.startsWith('data:')}
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            </Parallax>
            <div className="relative block h-full w-full sm:hidden">
              <Image
                key={content.backgroundImage}
                src={content.backgroundImage}
                alt="promotion background"
                fill
                sizes="(min-width: 768px) 100vw, 867px"
                className="object-cover"
                priority
                unoptimized={content.backgroundImage.includes('/uploads/') || content.backgroundImage.startsWith('data:')}
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
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
