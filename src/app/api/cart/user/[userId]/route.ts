import { prisma } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    userId: string;
  };
}

// GET /api/cart/user/[userId] - Fetch cart with all items and product details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 });
    }

    // Get cart with items and product details
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!cart) {
      return NextResponse.json({
        success: true,
        message: 'No cart found for user',
        data: {
          id: null,
          userId,
          items: [],
          totalItems: 0,
          totalAmount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    // Calculate totals
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const cartWithTotals = {
      ...cart,
      totalItems,
      totalAmount
    };

    return NextResponse.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cartWithTotals
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch cart'
    }, { status: 500 });
  }
}
