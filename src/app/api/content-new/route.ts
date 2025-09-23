import { simpleDbService } from '@/lib/simple-db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 NEW API: Fetching content from database...');
    
    // Direct call to simple database service 
    const siteContentItems = await simpleDbService.getAllSiteContent();

    console.log(`📋 NEW API: Found ${siteContentItems.length} content items`);

    // Convert to key-value pairs
    const contentData: Record<string, string> = {};
    
    siteContentItems.forEach((item: any) => {
      if (item.key && item.value !== null) {
        contentData[item.key] = item.value;
      }
    });

    // Log what we have for hero and promotions
    const heroVideo = contentData['hero_background_video'];
    const promoImage = contentData['promotion_background_image'];
    
    console.log('🎬 NEW API Hero video:', heroVideo ? `${(heroVideo.length / 1024 / 1024).toFixed(2)}MB` : 'none');
    console.log('🖼️ NEW API Promo image:', promoImage ? `${(promoImage.length / 1024).toFixed(0)}KB` : 'none');

    const response = {
      success: true,
      data: contentData,
      items: siteContentItems.map((item: any) => ({
        key: item.key,
        value: item.value,
        updatedAt: item.updatedAt
      })),
      count: siteContentItems.length,
      has_hero_video: !!heroVideo,
      has_promo_image: !!promoImage
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60'
      }
    });
  } catch (error) {
    console.error('❌ NEW API Content error:', error);
    
    // Enhanced fallback content with hero video support
    const fallbackContent = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        hero_title: 'Welcome to Our Fashion Store',
        hero_subtitle: 'Discover the Latest Trends',
        hero_description: 'Shop our collection of high-quality clothing for men and women.',
        hero_button_text: 'Shop Now',
        hero_background_image: '/images/placeholder-product.svg',
        hero_background_video: 'https://utfs.io/f/1rEveYHUVj032V42w1UQTMjXHRnPoA8hBUF7ftDzWE0r12b3',
        promotion_title: 'Winter Collection Now Available', 
        promotion_subtitle: 'Stay cozy and fashionable this winter with our new collection!',
        promotion_button_text: 'View Collection',
        promotion_button_link: '/search/winter-2024',
        promotion_background_image: '/images/placeholder-product.svg'
      }
    };

    return NextResponse.json(fallbackContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}