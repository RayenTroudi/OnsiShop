import { dbService } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Clear all items from cart
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    console.log('🗑️ Clear cart for user:', userId);

    // Find user's cart
    const cart = await dbService.getCartByUserId(userId);

    if (!cart) {
      return NextResponse.json({ 
        success: true, 
        message: 'No cart found to clear' 
      });
    }

    // Delete all cart items
    await dbService.clearCart(cart.id );

    console.log('✅ Cart cleared successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Cart cleared successfully' 
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
