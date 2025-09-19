import { prisma } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/cart/checkout - Deduct stock from products and clear the cart
export async function POST(request: NextRequest) {
  try {
    const { userId, cartId } = await request.json();

    if (!userId && !cartId) {
      return NextResponse.json({
        success: false,
        message: 'User ID or Cart ID is required'
      }, { status: 400 });
    }

    // Get cart with items
    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { id: cartId }
    }) as any;

    // Get cart items separately since our compatibility layer doesn't support include
    const cartItems = cart ? await prisma.cartItem.findMany({
      where: { cartId: cart.id }
    }) as any[] : [];

    if (!cart || cartItems.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Cart is empty or not found'
      }, { status: 404 });
    }

    // Validate stock for all items before processing
    for (const item of cart.items) {
      const product = item.product as any;
      if (product.stock < item.quantity) {
        return NextResponse.json({
          success: false,
          message: `Insufficient stock for ${product.name || product.title}. Only ${product.stock} available, but ${item.quantity} requested`
        }, { status: 400 });
      }
    }

    // Process checkout
    // Deduct stock from products
    for (const item of cartItems) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } }) as any;
      if (product) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: Math.max(0, product.stock - item.quantity) }
        });
      }
    }

    // Calculate order total
    const orderTotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Clear cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    const result = {
      orderId: `ORDER_${Date.now()}`,
      items: cartItems.length,
      totalAmount: orderTotal,
      processedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Checkout completed successfully',
      data: result
    });

  } catch (error) {
    console.error('Error during checkout:', error);
    return NextResponse.json({
      success: false,
      message: 'Checkout failed. Please try again'
    }, { status: 500 });
  }
}
