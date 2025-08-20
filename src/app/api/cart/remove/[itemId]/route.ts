import { prisma } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    itemId: string;
  };
}

// DELETE /api/cart/remove/[itemId] - Remove an item from cart
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { itemId } = params;

    if (!itemId) {
      return NextResponse.json({
        success: false,
        message: 'Item ID is required'
      }, { status: 400 });
    }

    // Check if cart item exists
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId }
    });

    if (!cartItem) {
      return NextResponse.json({
        success: false,
        message: 'Cart item not found'
      }, { status: 404 });
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to remove item from cart'
    }, { status: 500 });
  }
}
