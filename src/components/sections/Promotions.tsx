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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      console.log('🎯 Promotions: Direct UploadThing fetch from API');
      
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
          
          console.log('✅ Promotions: UploadThing content loaded');
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
      <div className="relative h-[570px] overflow-hidden sm:h-screen">
        <h2 className="sr-only">Promotions</h2>
        
        {/* Direct UploadThing Image Loading */}
        {content.backgroundImage && !loading && (
          <>
            <Parallax speed={-50} className="relative hidden h-full w-full sm:block">
              <Image
                src={content.backgroundImage}
                alt="promotion background"
                fill
                sizes="(min-width: 768px) 100vw, 867px"
                className="object-cover"
                priority={true}
                quality={90}
                unoptimized={content.backgroundImage.startsWith('data:')}
              />
            </Parallax>
            <div className="relative block h-full w-full sm:hidden">
              <Image
                src={content.backgroundImage}
                alt="promotion background"
                fill
                sizes="(max-width: 767px) 100vw, 867px"
                className="object-cover"
                priority={true}
                quality={90}
                unoptimized={content.backgroundImage.startsWith('data:')}
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
