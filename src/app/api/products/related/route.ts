import { DatabaseService, prisma } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';
const db = new DatabaseService();

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
    const currentProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    const where: any = {
      id: { not: productId },
      availableForSale: true,
    };

    // Prioritize products from the same category
    if (currentProduct?.categoryId) {
      where.categoryId = currentProduct.categoryId;
    } else if (tags.length > 0) {
      // Fallback to products with similar tags
      where.OR = tags.map(tag => ({
        tags: { contains: tag, mode: 'insensitive' },
      }));
    }

    // Fetch related products with ratings
    let relatedProducts = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { name: true },
        },
        ratings: {
          select: { stars: true },
        },
        _count: {
          select: { ratings: true },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    }) as any[];

    // If not enough products from same category, fetch more from other categories
    if (relatedProducts.length < limit) {
      const additionalProducts = await prisma.product.findMany({
        where: {
          id: { 
            not: productId,
            notIn: relatedProducts.map((p: any) => p.id),
          },
          availableForSale: true,
        },
        include: {
          category: {
            select: { name: true },
          },
          ratings: {
            select: { stars: true },
          },
          _count: {
            select: { ratings: true },
          },
        },
        take: limit - relatedProducts.length,
        orderBy: { createdAt: 'desc' },
      }) as any[];

      relatedProducts = [...relatedProducts, ...additionalProducts];
    }

    // Calculate average ratings and transform data
    const productsWithRatings = relatedProducts.map((product: any) => {
      const ratings = product.ratings;
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum: number, rating: any) => sum + rating.stars, 0) / ratings.length
        : null;

      // Remove ratings array from response and add calculated fields
      const { ratings: _, ...productData } = product;
      
      // Transform to Shopify format with proper image structure
      const transformedProduct = db.transformToShopifyProduct(productData);
      
      return {
        ...transformedProduct,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
        ratingCount: productData._count.ratings,
      };
    });

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
