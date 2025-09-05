import { prisma } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Get cart for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get userId from JWT token
    const token = request.cookies.get('auth-token')?.value;

    console.log('🛒 Cart GET API Debug:', {
      hasToken: !!token,
      tokenLength: token?.length || 0
    });

    if (!token) {
      console.log('🚫 No auth token found in cart GET API');
      return NextResponse.json({ 
        success: true,
        message: 'No authentication token found',
        data: {
          id: null,
          userId: null,
          items: [],
          totalItems: 0,
          totalAmount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
      console.log('✅ Cart GET token verified, userId:', userId);
    } catch (jwtError) {
      console.log('❌ Cart GET JWT verification failed:', jwtError);
      return NextResponse.json({
        success: false,
        message: 'Invalid authentication token'
      }, { status: 401 });
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

    console.log('🛒 Cart query result:', {
      userId,
      hasCart: !!cart,
      itemCount: cart?.items?.length || 0
    });

    if (!cart) {
      console.log('🛒 No cart found for user, returning empty cart');
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