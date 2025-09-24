import { dbService } from '@/lib/database';
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

    // Build where clause
    const where: any = {
      availableForSale: true,
    };

    // Category filter
    if (category) {
      where.category = {
        handle: category,
      };
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' }; // default: newest

    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'price-low':
        orderBy = { price: 'asc' };
        break;
      case 'price-high':
        orderBy = { price: 'desc' };
        break;
      case 'name-asc':
        orderBy = { name: 'asc' };
        break;
      case 'name-desc':
        orderBy = { name: 'desc' };
        break;
      case 'rating':
        // For rating sort, we'll need to use a more complex query
        // This is a simplified version - in production you might want to use raw SQL
        orderBy = { createdAt: 'desc' }; // fallback for now
        break;
    }

    // Fetch products with ratings
    const [products, totalCount] = await Promise.all([
      dbService.getProducts(),
      dbService.countProductsWithFilter({ where }),
    ]);

    // Debug logging
    console.log('Products fetched:', products?.length || 0);
    if (products && products.length > 0) {
      console.log('Sample product structure:', {
        hasRatings: 'ratings' in (products[0] as any),
        keys: Object.keys(products[0] as any).slice(0, 10)
      });
    }

    // Safety check for products array
    if (!Array.isArray(products)) {
      console.error('Products is not an array:', typeof products);
      return NextResponse.json({
        products: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
        hasNextPage: false,
        hasPrevPage: false,
      });
    }

    // Calculate average ratings for each product and transform to Shopify format
    const productsWithRatings = (products as any[]).map((product: any) => {
      try {
        const ratings = product.ratings || [];
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum: number, rating: any) => sum + (rating?.stars || 0), 0) / ratings.length
          : null;

        // Remove ratings array from response and add avgRating
        const { ratings: _, ...productWithoutRatings } = product;
        
        // Transform to Shopify format with proper image structure
        const transformedProduct = dbService.transformToShopifyProduct(productWithoutRatings);
        
        return {
          ...transformedProduct,
          avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        };
      } catch (productError) {
        console.error('Error processing product:', product?.id || 'unknown', productError);
        // Return a basic product structure if transformation fails
        return {
          id: product?.id || product?._id?.toString() || 'unknown',
          title: product?.title || product?.name || 'Unknown Product',
          handle: product?.handle || 'unknown',
          price: product?.price || 0,
          avgRating: null,
        };
      }
    }).filter(Boolean); // Remove any null/undefined results

    // Sort by rating if requested (post-processing since Prisma doesn't support it directly)
    if (sort === 'rating') {
      productsWithRatings.sort((a, b) => {
        const aRating = a.avgRating || 0;
        const bRating = b.avgRating || 0;
        return bRating - aRating; // descending order
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products: productsWithRatings,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
