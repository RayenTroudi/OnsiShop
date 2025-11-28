import { verifyAuth } from '@/lib/appwrite/auth';
import { dbService } from '@/lib/appwrite/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Get specific order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Get order with security check
    const order = await dbService.findFirstOrder({
      where: { id: params.id, userId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    // Get order items with product details
    const orderItems = await dbService.getOrderItems(order.id);
    
    // Populate product details for each order item
    const itemsWithProducts = await Promise.all(
      orderItems.map(async (item: any) => {
        const product = await dbService.getProductById(item.productId);
        return {
          ...item,
          product: product || {
            id: item.productId,
            name: 'Product Not Found',
            title: 'Product Not Found',
            image: '/images/placeholder-product.svg'
          }
        };
      })
    );
    
    // Add items to order
    const enrichedOrder = {
      ...order,
      items: itemsWithProducts
    };
    
    return NextResponse.json({ order: enrichedOrder });
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

// Update order status (admin only in a real app, simplified for demo)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const order = await dbService.updateOrder({
      where: { id: params.id },
      data: { status }
    });

    return NextResponse.json({ order, message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
