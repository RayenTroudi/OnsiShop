import { prisma } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Fetch ratings for a product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get all ratings for the product
    const ratings = await prisma.rating.findMany({
      where: {
        productId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }) as any[];

    // Calculate rating statistics
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, rating) => sum + rating.stars, 0) / totalRatings 
      : 0;

    // Calculate rating breakdown (1-5 stars)
    const ratingBreakdown = {
      1: ratings.filter(r => r.stars === 1).length,
      2: ratings.filter(r => r.stars === 2).length,
      3: ratings.filter(r => r.stars === 3).length,
      4: ratings.filter(r => r.stars === 4).length,
      5: ratings.filter(r => r.stars === 5).length,
    };

    return NextResponse.json({
      ratings,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingBreakdown,
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}

// POST - Add or update a rating
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { stars } = body;

    // Get user from JWT token
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      userId = decoded.userId;
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Validate input
    if (!stars || stars < 1 || stars > 5 || !Number.isInteger(stars)) {
      return NextResponse.json(
        { error: 'Rating must be an integer between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Create or update rating (upsert)
    const rating = await prisma.rating.upsert({
      where: {
        productId_userId: {
          productId: id,
          userId,
        },
      },
      update: {
        stars,
        updatedAt: new Date(),
      },
      create: {
        stars,
        productId: id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating rating:', error);
    return NextResponse.json(
      { error: 'Failed to create/update rating' },
      { status: 500 }
    );
  }
}
