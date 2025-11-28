import { dbService } from '@/lib/appwrite/database';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 Fetching content from Appwrite database...');
    
    const siteContentItems = await dbService.getAllSiteContent();
    console.log(`📋 Found ${siteContentItems.length} content items`);

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
    
    console.log('🎬 Hero video:', heroVideo ? 
      (heroVideo.startsWith('http') ? heroVideo : `Base64 (${(heroVideo.length / 1024 / 1024).toFixed(2)}MB)`) : 
      'none');
    console.log('🖼️ Promo image:', promoImage ? 
      (promoImage.startsWith('http') ? promoImage : `Base64 (${(promoImage.length / 1024).toFixed(0)}KB)`) : 
      'none');

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

    // Generate ETag for cache validation
    const contentString = JSON.stringify(response);
    const etag = `"${Buffer.from(contentString).toString('base64').slice(0, 16)}"`;
    
    return new NextResponse(contentString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Enable stale-while-revalidate caching
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300', // Cache for 1 min, stale for 5 min
        'ETag': etag,
        'Last-Modified': new Date().toUTCString(),
        'Vary': 'Accept-Encoding',
        // Add cache versioning
        'X-Cache-Version': '1.1.0',
        'X-Content-Hash': etag
      }
    });
  } catch (error) {
    console.error('❌ Content API error:', error);
    
    // Check if it's a circuit breaker error or timeout
    if (error instanceof Error && 
        (error.message.includes('Circuit breaker is OPEN') || error.message.includes('timeout'))) {
      console.warn('🔴 Database issue detected, returning fallback content');
    }
    
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
        hero_background_video: 'https://utfs.io/f/1rEveYHUVj032V42w1UQTMjXHRnPoA8hBUF7ftDzWE0r12b3', // Use known working video
        promotion_title: 'Winter Collection Now Available', 
        promotion_subtitle: 'Stay cozy and fashionable this winter with our new collection!',
        promotion_button_text: 'View Collection',
        promotion_button_link: '/search/winter-2024',
        promotion_background_image: '/images/placeholder-product.svg'
      }
    };

    return new NextResponse(JSON.stringify(fallbackContent), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
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
