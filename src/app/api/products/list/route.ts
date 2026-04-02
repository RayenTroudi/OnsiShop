import { dbService } from '@/lib/appwrite/database';
import { NextRequest, NextResponse } from 'next/server';


export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    // Fetch using the paginated method which properly handles category + search filters
    const result = await dbService.getProductsPaginated({ page, limit, category, search });
    const { products, totalCount, totalPages } = result;

    if (!Array.isArray(products)) {
      return NextResponse.json({
        products: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        hasNextPage: false,
        hasPrevPage: false,
        success: true,
      });
    }

    const productsWithRatings = (products as any[])
      .map((product: any) => {
        try {
          const transformed = dbService.transformToShopifyProduct(product);
          return { ...transformed, avgRating: null };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({
      products: productsWithRatings,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
