import { prisma } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;
    const itemId = params.id;

    console.log('🗑️ Remove cart item:', { userId, itemId });

    // Verify the cart item belongs to the user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId }
    }) as any;

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    // Get the cart to check ownership
    const cart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId }
    }) as any;

    if (!cart || cart.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the cart item
    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    console.log('✅ Cart item removed successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Item removed from cart' 
    });

  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
  }
}
