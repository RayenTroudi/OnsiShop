'use client';

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
  const [content, setContent] = useState<PromotionContent>({
    backgroundImage: '',
    buttonLink: '/search/winter-2024',
    title: 'Winter Collection Now Available',
    subtitle: 'Stay cozy and fashionable this winter with our new collection!',
    buttonText: 'View Collection'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      console.log('🎯 Promotions: Fetching real content from API');
      setImageError(false);
      
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
        setContent({
          backgroundImage: '',
          buttonLink: '/search/winter-2024',
          title: 'Winter Collection Now Available',
          subtitle: 'Stay cozy and fashionable this winter with our new collection!',
          buttonText: 'View Collection'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  return (
    <ParallaxProvider>
      <div className="relative h-[570px] overflow-hidden sm:h-screen">
        <h2 className="sr-only">Promotions</h2>
        
        {/* Simple loading state */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100/80 z-10" />
        )}
        

        
        {/* Images */}
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
                priority={false} // Lazy load for better performance
                loading="lazy" // Explicit lazy loading
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
                sizes="(max-width: 767px) 100vw, 867px"
                className="object-cover transition-opacity duration-300"
                priority={false} // Lazy load for better performance
                loading="lazy" // Explicit lazy loading
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
