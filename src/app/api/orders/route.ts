import { prisma } from '@/lib/database';
import { sendCustomerConfirmationEmail, sendOrderNotificationEmail } from '@/lib/email';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Get orders for authenticated user
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

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
    console.log('🛒 Order creation started...');
    const token = request.cookies.get('auth-token')?.value;
    const cartId = request.cookies.get('cartId')?.value;

    console.log('🍪 Order POST Debug:', { 
      hasToken: !!token, 
      tokenLength: token?.length,
      hasCartId: !!cartId 
    });

    if (!token) {
      console.log('❌ Order creation failed: No token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const userId = decoded.userId;
    console.log('✅ Order creation token verified, userId:', userId);

    const { fullName, email, phone, shippingAddress } = await request.json();
    console.log('📝 Order data received:', { fullName, email, phone, shippingAddress });

    // Validate required fields
    if (!fullName || !email || !phone || !shippingAddress) {
      console.log('❌ Order creation failed: Missing required fields');
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Get cart items for the authenticated user
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    }) as any;

    if (!cart || cart.items.length === 0) {
      console.log('❌ Order creation failed: Cart is empty', { 
        cartExists: !!cart, 
        itemCount: cart?.items?.length || 0 
      });
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    console.log('✅ Cart found with items:', cart.items.length);

    // Calculate total amount
    const totalAmount = cart.items.reduce(
      (sum: number, item: any) => sum + (item.product.price * item.quantity),
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

    // Create order (replacing transaction with sequential operations)
    // Create the order
    const newOrder = await prisma.order.create({
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
      await prisma.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        }
      });

      // Update product stock
      const currentProduct = await prisma.product.findUnique({
        where: { id: item.productId }
      }) as any;
      
      if (currentProduct) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: currentProduct.stock - item.quantity
          }
        });
      }
    }

    // Clear the cart items but keep the cart
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    const order = newOrder;

    // Send email notifications
    try {
      const orderEmailData = {
        orderId: order.id,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress,
        items: cart.items.map((item: any) => ({
          name: item.product.name || item.product.title || 'Product',
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount
      };

      // Send notification email to store owner
      const notificationResult = await sendOrderNotificationEmail(orderEmailData);
      if (notificationResult.success) {
        console.log('📧 Order notification email sent successfully');
      } else {
        console.error('❌ Failed to send order notification email:', notificationResult.error);
      }

      // Send confirmation email to customer
      const confirmationResult = await sendCustomerConfirmationEmail(orderEmailData);
      if (confirmationResult.success) {
        console.log('📧 Customer confirmation email sent successfully');
      } else {
        console.error('❌ Failed to send customer confirmation email:', confirmationResult.error);
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      // Don't fail the order creation if email fails
    }

    // Clear cart cookie (though we're not using it anymore)
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
