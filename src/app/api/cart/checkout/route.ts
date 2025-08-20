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
      where: userId ? { userId } : { id: cartId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
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

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Deduct stock from products
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Calculate order total
      const orderTotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

      // Clear cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      return {
        orderId: `ORDER_${Date.now()}`,
        items: cart.items.length,
        totalAmount: orderTotal,
        processedAt: new Date().toISOString()
      };
    });

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
