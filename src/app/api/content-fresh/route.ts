// Fresh content API to bypass caching issues
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const content = {
    success: true,
    data: {
      hero_title: 'Welcome to Our Fashion Store',
      hero_subtitle: 'Discover the Latest Trends',
      hero_description: 'Shop our collection of high-quality clothing.',
      hero_button_text: 'Shop Now',
      hero_background_image: '/images/placeholder-product.svg',
      hero_background_video: '',
      promotion_title: 'Winter Collection Now Available', 
      promotion_subtitle: 'Stay cozy and fashionable this winter with our new collection!',
      promotion_button_text: 'View Collection',
      promotion_button_link: '/search/winter-2024',
      promotion_background_image: '/images/placeholder-product.svg'
    },
    source: 'fresh-static-api',
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(content, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
}