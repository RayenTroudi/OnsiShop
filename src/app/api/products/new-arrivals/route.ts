import { dbService } from '@/lib/appwrite/database';
import { withConnectionMonitoring } from '@/lib/connectionMonitor';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/products/new-arrivals - Get recent products (optimized)
export async function GET(request: NextRequest) {
  return withConnectionMonitoring(async () => {
    const startTime = Date.now();
    
    try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    
    console.log(`🆕 New Arrivals API: fetching ${limit} products`);

    // Use optimized method
    const products = await dbService.getRecentProducts(limit);

    // Transform to Shopify format
    const transformedProducts = products.map(product => dbService.transformToShopifyProduct(product));

    const responseTime = Date.now() - startTime;
    console.log(`⚡ New Arrivals API completed in ${responseTime}ms (${transformedProducts.length} products)`);

    const response = NextResponse.json({
      products: transformedProducts,
      count: transformedProducts.length,
      success: true
    });

    // Cache for 5 minutes in browser, 15 minutes in CDN (new arrivals change less frequently)
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=900');
    
    return response;
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch new arrivals', success: false },
        { status: 500 }
      );
    }
  }, 'GET /api/products/new-arrivals');
}