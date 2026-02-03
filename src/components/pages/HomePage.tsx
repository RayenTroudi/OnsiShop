'use client';

import BestSellers from '@/components/sections/BestSellers';
import CategoriesSection from '@/components/sections/CategoriesSection';
import FeaturedProductsSection from '@/components/sections/FeaturedProductsSection';
import HeroSection from '@/components/sections/HeroSection';
import NewArrivals from '@/components/sections/NewArrivals';
import Promotions from '@/components/sections/Promotions';
import TrustBar from '@/components/sections/TrustBar';
import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    document.title = 'OnsiShop - Premium Fashion E-commerce';
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <TrustBar />
      <NewArrivals />
      <BestSellers />
      <Promotions />
    </main>
  );
}
