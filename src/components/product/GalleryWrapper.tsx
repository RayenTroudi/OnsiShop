'use client';

import { Suspense } from 'react';
import { Gallery } from './gallery';

interface GalleryWrapperProps {
  images: { src: string; altText: string }[];
}

export default function GalleryWrapper({ images }: GalleryWrapperProps) {
  return (
    <Suspense fallback={
      <div className="relative aspect-square h-full max-h-[550px] w-full overflow-hidden">
        <div className="animate-pulse bg-gray-200 w-full h-full rounded-lg"></div>
        {images.length > 1 && (
          <div className="absolute bottom-[15%] flex w-full justify-center">
            <div className="mx-1 mb-3 flex h-11 items-center rounded-full border border-white bg-gray-100/80 text-white backdrop-blur-md">
              <div className="h-6 w-6 bg-gray-300 rounded mx-3 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    }>
      <Gallery images={images} />
    </Suspense>
  );
}
