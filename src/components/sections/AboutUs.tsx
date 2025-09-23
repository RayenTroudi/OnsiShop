'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Direct image loading - no lazy loading needed with UploadThing CDN

interface AboutContent {
  title: string;
  description: string;
  buttonText: string;
  backgroundImage?: string;
}

const AboutUs = () => {
  const { t } = useTranslation();
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Direct loading for better performance with UploadThing CDN

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        const result = await response.json();

        if (result.success) {
          const data = result.data;
          setContent({
            title: data['about_title'] || t('about_title'),
            description: data['about_description'] || t('about_description'),
            buttonText: data['about_button_text'] || t('about_button_text'),
            backgroundImage: data['about_background_image']
          });
        } else {
          // Fallback to translations
          setContent({
            title: t('about_title'),
            description: t('about_description'),
            buttonText: t('about_button_text')
          });
        }
      } catch (error) {
        console.error('Error fetching about content:', error);
        // Fallback to translations
        setContent({
          title: t('about_title'),
          description: t('about_description'),
          buttonText: t('about_button_text')
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [t]);

  if (loading) {
    return (
      <section className="flex items-center justify-center border-t-[1px] border-purple bg-lightPurple py-[48px] md:py-[64px]">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-96 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-80 mb-4"></div>
          <div className="h-10 bg-gray-300 rounded w-32"></div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="flex items-center justify-center border-t-[1px] border-purple bg-lightPurple py-[48px] md:py-[64px] relative overflow-hidden"
    >
      {/* Direct UploadThing image loading */}
      {content?.backgroundImage && (
        <>
          <Image
            src={content.backgroundImage}
            alt="About us background"
            fill
            className="object-cover"
            priority={true}
            quality={90}
            unoptimized={content.backgroundImage.startsWith('data:')}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
        </>
      )}
      <h2 className="sr-only">About Us Section</h2>
      <div className="flex max-w-[95%] flex-col items-center justify-center gap-[32px] text-center md:max-w-[700px] relative z-20">
        <h3 className={`font-lora text-[clamp(28px,18px_+_2vw,40px)] font-semibold ${content?.backgroundImage ? 'text-white' : 'text-veryDarkPurple'}`}>
          {content?.title}
        </h3>
        <p className={`max-w-[90%] font-lora text-[clamp(20px,14px_+_2vw,24px)] font-medium leading-relaxed md:max-w-none md:leading-normal ${content?.backgroundImage ? 'text-gray-100' : 'text-darkPurple'}`}>
          {content?.description}
        </p>
        <a href="/about-us" className={`btn-very-dark mt-2 text-[clamp(18px,10px_+_2vw,22px)] ${content?.backgroundImage ? 'bg-white text-gray-900 hover:bg-gray-100' : ''}`}>
          {content?.buttonText}
        </a>
      </div>
    </section>
  );
};

export default AboutUs;
