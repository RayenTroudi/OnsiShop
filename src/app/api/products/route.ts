import { DatabaseService } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Use nextUrl.searchParams instead of new URL(request.url)
    const collection = request.nextUrl.searchParams.get('collection');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');

    const db = new DatabaseService();
    let products;

    if (collection) {
      // Get products by specific category
      products = await db.getProductsByCategory(collection);
    } else {
      // Get all products if no collection specified
      products = await db.getProducts();
    }
    
    // Transform products to Shopify format and limit the results
    const transformedProducts = products
      .map(product => db.transformToShopifyProduct(product))
      .slice(0, limit);
    
    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
