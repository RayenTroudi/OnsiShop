// Emergency static content API - bypassing database size limits
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const staticContent = {
    success: true,
    data: {
      hero_title: 'Welcome to Our Fashion Store',
      hero_subtitle: 'Discover the Latest Trends',
      hero_description: 'Shop our collection of high-quality clothing for men and women.',
      hero_button_text: 'Shop Now',
      hero_background_image: '/images/placeholder-product.svg',
      hero_background_video: '',
      promotion_title: 'Winter Collection Now Available', 
      promotion_subtitle: 'Stay cozy and fashionable this winter with our new collection!',
      promotion_button_text: 'View Collection',
      promotion_button_link: '/search/winter-2024',
      promotion_background_image: '/images/placeholder-product.svg',
      about_title: 'About Our Store',
      about_description: 'We are passionate about bringing you the finest clothing at affordable prices.',
      footer_company_name: 'OnsiShop',
      footer_description: 'Your Fashion Destination'
    },
    items: [],
    emergency_mode: true,
    note: 'Database size (6.44MB) exceeds Vercel 5MB query limit due to base64 images'
  };

  return new NextResponse(JSON.stringify(staticContent), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}

export async function POST() {
  return new NextResponse(JSON.stringify({
    success: false,
    message: 'Updates disabled - database size limit exceeded'
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}
