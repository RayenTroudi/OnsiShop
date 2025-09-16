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
    backgroundImage: '/images/placeholder.jpg',
    buttonLink: '/search/winter-2024',
    title: 'have fun',
    subtitle: 'very nice collection',
    buttonText: 'check'
  });

  useEffect(() => {
    // Load promotion content from database (only background image and link)
    const fetchContent = async () => {
      try {
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
              backgroundImage: result.data['promotion.backgroundImage'] || '/images/placeholder.jpg',
              buttonLink: result.data['promotion.buttonLink'] || '/search/winter-2024',
              title: result.data['promotion.title'] || 'have fun',
              subtitle: result.data['promotion.subtitle'] || 'very nice collection',
              buttonText: result.data['promotion.buttonText'] || 'check'
            };
            
            console.log('Setting promotion content:', newContent);
            setContent(newContent);
          }
        }
      } catch (error) {
        console.error('Error loading promotion content:', error);
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
          
          setContent(prevContent => ({
            backgroundImage: updatedContent['promotion.backgroundImage'] || prevContent.backgroundImage,
            buttonLink: updatedContent['promotion.buttonLink'] || prevContent.buttonLink,
            title: updatedContent['promotion.title'] || prevContent.title,
            subtitle: updatedContent['promotion.subtitle'] || prevContent.subtitle,
            buttonText: updatedContent['promotion.buttonText'] || prevContent.buttonText
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
        <Parallax speed={-50} className="relative hidden h-full w-full sm:block">
          <Image
            key={content.backgroundImage}
            src={content.backgroundImage}
            alt="promotion background"
            fill
            sizes="(min-width: 768px) 100vw, 867px"
            className="object-cover"
            priority
            unoptimized={content.backgroundImage.includes('/uploads/')}
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
            unoptimized={content.backgroundImage.includes('/uploads/')}
          />
        </div>
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
