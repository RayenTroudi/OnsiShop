import { dbService } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// PUT /api/cart/update - Update quantity of an item
export async function PUT(request: NextRequest) {
  try {
    const { itemId, quantity } = await request.json();

    if (!itemId || quantity === undefined) {
      return NextResponse.json({
        success: false,
        message: 'Item ID and quantity are required'
      }, { status: 400 });
    }

    if (quantity < 0) {
      return NextResponse.json({
        success: false,
        message: 'Quantity cannot be negative'
      }, { status: 400 });
    }

    // Get the cart item and product info separately
    const cartItem = await dbService.getCartItemById(itemId) as any;

    if (!cartItem) {
      return NextResponse.json({
        success: false,
        message: 'Cart item not found'
      }, { status: 404 });
    }

    // Get product info
    const product = await dbService.getProductById(cartItem.productId ) as any;
    if (product.stock < quantity) {
      return NextResponse.json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available`
      }, { status: 400 });
    }

    // If quantity is 0, remove the item
    if (quantity === 0) {
      await dbService.deleteCartItem(cartItem.cartId, cartItem.productId, cartItem.variantId);

      return NextResponse.json({
        success: true,
        message: 'Item removed from cart',
        data: null
      });
    }

    // Update quantity
    const updatedItem = await dbService.updateCartItem(itemId, { quantity });

    return NextResponse.json({
      success: true,
      message: 'Cart item updated successfully',
      data: updatedItem
    });

  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update cart item'
    }, { status: 500 });
  }
}
