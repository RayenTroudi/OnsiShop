import { dbService } from '@/lib/database';
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

    // Get cart and items separately (compatibility layer doesn't support include)
    const cart = await dbService.getCartByUserId(userId) as any;

    // Get cart items if cart exists
    let cartItems: any[] = [];
    if (cart) {
      cartItems = await dbService.getCartItems(cart.id ) as any[];
    }

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
    const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const cartWithTotals = {
      ...cart,
      items: cartItems,
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
