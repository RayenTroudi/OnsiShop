'use client';

import { useLoading } from '@/contexts/LoadingContext';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Direct imports for components that work
import HeroSection from '@/components/sections/HeroSection';

// Loading fallback component
const SectionSkeleton = () => (
  <div className="w-full py-12 animate-pulse">
    <div className="container mx-auto px-4">
      <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

// Error fallback component
const SectionError = ({ error, retry }: { error: string, retry: () => void }) => (
  <div className="w-full py-12">
    <div className="container mx-auto px-4 text-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Section Failed to Load</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={retry}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

// Dynamic imports with better error handling
const Discounts = dynamic(() => import('@/components/sections/Discounts').catch(err => {
  console.error('Failed to load Discounts component:', err);
  return { default: () => <SectionError error="Discounts section failed to load" retry={() => window.location.reload()} /> };
}), {
  ssr: false,
  loading: () => <div className="w-full h-12 bg-purple-600 animate-pulse"></div>
});

const BestSellers = dynamic(() => import('@/components/sections/BestSellers').catch(err => {
  console.error('Failed to load BestSellers component:', err);
  return { default: () => <SectionError error="Best Sellers section failed to load" retry={() => window.location.reload()} /> };
}), {
  ssr: false,
  loading: () => <SectionSkeleton />
});

const Promotions = dynamic(() => import('@/components/sections/Promotions').catch(err => {
  console.error('Failed to load Promotions component:', err);
  return { default: () => <SectionError error="Promotions section failed to load" retry={() => window.location.reload()} /> };
}), {
  ssr: false,
  loading: () => <SectionSkeleton />
});

const NewArrivals = dynamic(() => import('@/components/sections/NewArrivals/NewArrivals').catch(err => {
  console.error('Failed to load NewArrivals component:', err);
  return { default: () => <SectionError error="New Arrivals section failed to load" retry={() => window.location.reload()} /> };
}), {
  ssr: false,
  loading: () => <SectionSkeleton />
});

const AboutUs = dynamic(() => import('@/components/sections/AboutUs').catch(err => {
  console.error('Failed to load AboutUs component:', err);
  return { default: () => <SectionError error="About Us section failed to load" retry={() => window.location.reload()} /> };
}), {
  ssr: false,
  loading: () => <SectionSkeleton />
});

export default function HomePage() {
  const { isLoading, loadingTasks } = useLoading();

  return (
    <main className={isLoading ? "" : "fade-in-content"}>
      {/* Always render HeroSection so video can load */}
      <Suspense fallback={<div className="w-full h-screen bg-gradient-to-br from-purple-900 to-pink-600 animate-pulse"></div>}>
        <HeroSection />
      </Suspense>
      
      {/* Only render other sections when loading is complete */}
      {!isLoading && (
        <>
          <Suspense fallback={<div className="w-full h-12 bg-purple-600 animate-pulse"></div>}>
            <Discounts />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton />}>
            <BestSellers />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton />}>
            <Promotions />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton />}>
            <NewArrivals />
          </Suspense>
          
          <Suspense fallback={<SectionSkeleton />}>
            <AboutUs />
          </Suspense>
        </>
      )}
    </main>
  );
}