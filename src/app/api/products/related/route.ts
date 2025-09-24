import { dbService } from '@/lib/database';
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

    // First, get the current product to find its category
    const currentProduct = await dbService.getProductById(productId );

    const where: any = {
      id: { not: productId },
      availableForSale: true,
    };

    // Prioritize products from the same category
    if ((currentProduct as any)?.categoryId) {
      where.categoryId = (currentProduct as any).categoryId;
    } else if (tags.length > 0) {
      // Fallback to products with similar tags
      where.OR = tags.map(tag => ({
        tags: { contains: tag, mode: 'insensitive' },
      }));
    }

    // Fetch related products with ratings
    let relatedProducts = await dbService.getProducts() as any[];
    
    // Debug logging
    console.log('Related products fetched:', relatedProducts?.length || 0);
    if (relatedProducts && relatedProducts.length > 0) {
      console.log('Sample related product structure:', {
        hasRatings: 'ratings' in relatedProducts[0],
        keys: Object.keys(relatedProducts[0]).slice(0, 10)
      });
    }

    // Safety check for products array
    if (!Array.isArray(relatedProducts)) {
      console.error('Related products is not an array:', typeof relatedProducts);
      return NextResponse.json({
        products: [],
        total: 0,
      });
    }

    // If not enough products from same category, fetch more from other categories
    if (relatedProducts.length < limit) {
      const additionalProducts = await dbService.getProducts() as any[];

      relatedProducts = [...relatedProducts, ...additionalProducts];
    }

    // Calculate average ratings and transform data
    const productsWithRatings = relatedProducts.map((product: any) => {
      try {
        const ratings = product.ratings || [];
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum: number, rating: any) => sum + (rating?.stars || 0), 0) / ratings.length
          : null;

        // Remove ratings array from response and add calculated fields
        const { ratings: _, ...productData } = product;
        
        // Transform to Shopify format with proper image structure
        const transformedProduct = dbService.transformToShopifyProduct(productData);
        
        return {
          ...transformedProduct,
          avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
          ratingCount: productData._count?.ratings || 0,
        };
      } catch (productError) {
        console.error('Error processing related product:', product?.id || 'unknown', productError);
        // Return a basic product structure if transformation fails
        return {
          id: product?.id || product?._id?.toString() || 'unknown',
          title: product?.title || product?.name || 'Unknown Product',
          handle: product?.handle || 'unknown',
          price: product?.price || 0,
          avgRating: null,
          ratingCount: 0,
        };
      }
    }).filter(Boolean); // Remove any null/undefined results

    return NextResponse.json({
      products: productsWithRatings,
      total: productsWithRatings.length,
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related products' },
      { status: 500 }
    );
  }
}
