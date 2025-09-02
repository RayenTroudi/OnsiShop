import { prisma } from '@/lib/database';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Get orders for authenticated user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// Create new order
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const cartId = cookieStore.get('cartId')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;

    const { fullName, email, phone, shippingAddress } = await request.json();

    // Validate required fields
    if (!fullName || !email || !phone || !shippingAddress) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Get cart items
    if (!cartId) {
      return NextResponse.json({ error: 'No cart found' }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );

    // Check stock availability
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json(
          { 
            error: `Insufficient stock for ${item.product.name || item.product.title}. Available: ${item.product.stock}, Requested: ${item.quantity}` 
          },
          { status: 400 }
        );
      }
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          fullName,
          email,
          phone,
          shippingAddress,
          totalAmount,
          status: 'pending'
        }
      });

      // Create order items and update product stock
      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }
        });

        // Update product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId }
      });

      await tx.cart.delete({
        where: { id: cartId }
      });

      return newOrder;
    });

    // Clear cart cookie
    const response = NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: 'Order placed successfully!' 
    });
    
    response.cookies.set('cartId', '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
