// next
import dynamic from 'next/dynamic';

// loading component
import Loading from '@/components/common/Loading';
const loading = () => <Loading />;

// components
import HomeVideo from '@/components/sections/HomeVideo';
const Discounts = dynamic(() => import('@/components/sections/Discounts'), {
  loading
});
const BestSellers = dynamic(() => import('@/components/sections/BestSellers'), {
  loading
});
const Promotions = dynamic(() => import('@/components/sections/Promotions'), {
  loading
});
const NewArrivals = dynamic(() => import('@/components/sections/NewArrivals/NewArrivals'), {
  loading
});
const AboutUs = dynamic(() => import('@/components/sections/AboutUs'), {
  loading
});

export const runtime = 'edge';

export const metadata = {
  description: 'ONSI clothing store e-commerce website',
  keywords: ['onsi', 'clothing', 'store', 'clothing store', 'e-commerce', 'fashion'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'ONSI',
    siteName: 'ONSI',
    description: 'ONSI clothing store e-commerce website',
    images: {
      url: '/images/screenshots/home.webp',
      alt: 'ONSI Clothing Store',
      width: 1200,
      height: 660,
      type: 'image/webp',
      secureUrl: '/images/screenshots/home.webp'
    }
  }
};

export default async function HomePage() {
  return (
    <>
      <HomeVideo />
      <Discounts />
      <BestSellers />
      <Promotions />
      <NewArrivals />
      <AboutUs />
    </>
  );
}
