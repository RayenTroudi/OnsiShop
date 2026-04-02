import { dbService } from '@/lib/appwrite/database';
import { NextRequest, NextResponse } from 'next/server';


export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const productId = searchParams.get('productId');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const currentProduct = await dbService.getProductById(productId) as any;
    const categoryHandle = currentProduct?.category?.handle || 'women-clothing';

    const result = await dbService.getProductsPaginated({
      page: 1,
      limit: limit + 1, // fetch one extra so we can exclude current product
      category: categoryHandle,
    });

    const relatedProducts = result.products
      .filter((p: any) => (p.$id || p.id) !== productId)
      .slice(0, limit)
      .map((product: any) => {
        try {
          return dbService.transformToShopifyProduct(product);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({
      products: relatedProducts,
      total: relatedProducts.length,
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related products' },
      { status: 500 }
    );
  }
}
