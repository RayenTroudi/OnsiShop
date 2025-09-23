'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
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
      
      {/* Background image if available - Direct UploadThing fetch */}
      {!loading && content?.backgroundImage && (
        <>
          <Image
            src={content.backgroundImage}
            alt="Footer background"
            fill
            className="object-cover z-0"
            priority={true}
            quality={90}
            unoptimized={content.backgroundImage.startsWith('data:')}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-white bg-opacity-85 z-10"></div>
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
