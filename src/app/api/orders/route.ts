import { verifyAuth } from '@/lib/appwrite/auth';
import { dbService } from '@/lib/appwrite/database';
import { sendCustomerConfirmationEmail, sendOrderNotificationEmail } from '@/lib/email';
import { withMongoCleanup } from '@/lib/withMongoCleanup';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Get orders for authenticated user
async function handleGET(request: NextRequest) {
  try {
    const user = await verifyAuth();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    const orders = await dbService.findManyOrders({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Populate each order with its items and product details
    const ordersWithItems = await Promise.all(
      orders.map(async (order: any) => {
        const orderItems = await dbService.getOrderItems(order.id);
        
        // Enhance order items with product details
        const itemsWithProducts = await Promise.all(
          orderItems.map(async (item: any) => {
            const product = await dbService.getProductById(item.productId);
            return {
              ...item,
              product: product || {
                id: item.productId,
                name: 'Unknown Product',
                title: 'Unknown Product',
                price: item.price,
                image: '/images/placeholder-product.svg'
              }
            };
          })
        );

        return {
          ...order,
          items: itemsWithProducts
        };
      })
    );

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// Create new order
async function handlePOST(request: NextRequest) {
  try {
    console.log('🛒 Order creation started...');
    const cartId = request.cookies.get('cartId')?.value;

    const user = await verifyAuth();

    if (!user) {
      console.log('❌ Order creation failed: Not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    console.log('✅ Order creation authenticated, userId:', userId);

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
    const cart = await dbService.getCartByUserId(userId);
    const cartItems = cart ? await dbService.getCartItems(cart.id) : [];
    
    // Enhance cart items with product details
    const cartItemsWithProducts = await Promise.all(
      cartItems.map(async (item: any) => {
        const product = await dbService.getProductById(item.productId);
        return { ...item, product };
      })
    );
    
    // Create enhanced cart object
    const enhancedCart = {
      ...cart,
      items: cartItemsWithProducts
    };

    if (!enhancedCart || enhancedCart.items.length === 0) {
      console.log('❌ Order creation failed: Cart is empty', { 
        cartExists: !!enhancedCart, 
        itemCount: enhancedCart?.items?.length || 0 
      });
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    console.log('✅ Cart found with items:', enhancedCart.items.length);

    // Calculate total amount
    const totalAmount = enhancedCart.items.reduce(
      (sum: number, item: any) => sum + (item.product.price * item.quantity),
      0
    );

    // Check stock availability
    for (const item of enhancedCart.items) {
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
    const newOrder = await dbService.createOrder({
      userId,
      fullName,
      email,
      phone,
      shippingAddress,
      totalAmount,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Order created successfully:', {
      orderId: newOrder.id,
      userId: userId,
      storedUserId: (newOrder as any).userId
    });

    // Create order items and update product stock
    for (const item of enhancedCart.items) {
      await dbService.createOrderItem({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      });

      // Update product stock
      const currentProduct = await dbService.getProductById(item.productId) as any;
      
      if (currentProduct) {
        await dbService.updateProduct(item.productId, {
          stock: currentProduct.stock - item.quantity
        });
      }
    }

    // Clear the cart items but keep the cart
    if (enhancedCart?.id) {
      await dbService.clearCart(enhancedCart.id);
    }

    const order = newOrder;

    // Send email notifications
    try {
      const orderEmailData = {
        orderId: order.id,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress,
        items: enhancedCart.items.map((item: any) => ({
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

// Wrap with aggressive MongoDB cleanup
export async function GET(request: NextRequest) {
  return withMongoCleanup(handleGET, request);
}

export async function POST(request: NextRequest) {
  return withMongoCleanup(handlePOST, request);
}
