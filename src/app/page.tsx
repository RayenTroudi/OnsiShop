// components
import HomePage from '@/components/pages/HomePage';

// Removed edge runtime to fix Prisma bundling issues
// export const runtime = 'edge';

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

export default async function HomePageRoute() {
  return <HomePage />;
}
