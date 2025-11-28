import { verifyAuth } from '@/lib/appwrite/auth';
import { dbService } from '@/lib/appwrite/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Clear all items from cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuth();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

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
