'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
// media cache
import { useCachedImage } from '@/hooks/useMediaCache';
// components
import Categories from './Categories';
import CopyRight from './CopyRight';
import Disclaimer from './Disclaimer';
import PaymentMethods from './PaymentMethods';
import SocialMedia from './SocialMedia';

interface FooterContent {
  backgroundImage?: string;
}

const index = () => {
  const [content, setContent] = useState<FooterContent | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Cached image hook for background image
  const {
    url: cachedImageUrl,
    loading: imageLoading,
    cached: imageCached,
    progress: imageProgress
  } = useCachedImage({
    src: content?.backgroundImage || '',
    autoCache: !!content?.backgroundImage,
    quality: 75,
    format: 'auto',
    preload: false // Footer is lower priority
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/content');
        const result = await response.json();

        if (result.success && result.data) {
          setContent({
            backgroundImage: result.data['footer_background_image']
          });
        }
      } catch (error) {
        console.error('Error fetching footer content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <footer className="relative flex items-center justify-center border-t-[1px] border-purple p-[24px] md:p-[48px] overflow-hidden">
      <h2 className="sr-only">Footer</h2>
      
      {/* Background image if available - Cached UploadThing fetch */}
      {!loading && cachedImageUrl && (
        <>
          <Image
            src={cachedImageUrl}
            alt="Footer background"
            fill
            className="object-cover z-0"
            priority={false} // Footer is lower priority
            quality={75}
            unoptimized={content?.backgroundImage?.startsWith('data:')}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-white bg-opacity-85 z-10"></div>
          
          {/* Cache status indicators */}
          {imageCached && (
            <div className="absolute bottom-4 right-4 z-50 bg-green-500/80 text-white px-2 py-1 text-xs rounded">
              📦 Cached Footer
            </div>
          )}
          {imageLoading && imageProgress && (
            <div className="absolute bottom-4 right-4 z-50 bg-blue-500/80 text-white px-2 py-1 text-xs rounded">
              📥 {imageProgress.percentage}%
            </div>
          )}
        </>
      )}
      
      <div className="flex w-full max-w-full flex-col items-start justify-between md:w-[1440px] md:flex-row relative z-20">
        <Categories />
        <div className="my-8 flex flex-col items-center justify-center gap-8 md:my-0">
          <SocialMedia />
          <CopyRight />
          <PaymentMethods />
        </div>
        <Disclaimer />
      </div>
    </footer>
  );
};

export default index;
