import { verifyAuth } from '@/lib/appwrite/auth';
import { dbService } from '@/lib/appwrite/database';
import { withMongoCleanup } from '@/lib/withMongoCleanup';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Get cart for authenticated user
async function handleGET(request: NextRequest) {
  try {
    // Get user from Appwrite session
    const user = await verifyAuth();

    console.log('🛒 Cart GET API Debug:', {
      hasUser: !!user,
      userId: user?.id
    });

    if (!user) {
      console.log('🚫 No auth user found in cart GET API');
      return NextResponse.json({ 
        success: true,
        message: 'No authentication found',
        data: {
          id: null,
          userId: null,
          items: [],
          totalItems: 0,
          totalAmount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    const userId = user.id;

    // Get cart and items separately (compatibility layer doesn't support include)
    const cart = await dbService.getCartByUserId(userId) as any;

    // Get cart items if cart exists
    let cartItems: any[] = [];
    if (cart) {
      const rawCartItems = await dbService.getCartItems(cart.id) as any[];
      
      // Populate product data for each cart item
      cartItems = await Promise.all(
        rawCartItems.map(async (item: any) => {
          const product = await dbService.getProductById(item.productId) as any;
          return {
            ...item,
            product: product || {
              id: item.productId,
              name: 'Product Not Found',
              title: 'Product Not Found',
              price: 0,
              stock: 0
            }
          };
        })
      );
    }

    console.log('🛒 Cart query result:', {
      userId,
      hasCart: !!cart,
      itemCount: cartItems.length || 0,
      itemsWithProducts: cartItems.filter(item => item.product).length
    });

    if (!cart) {
      console.log('🛒 No cart found for user, returning empty cart');
      return NextResponse.json({
        success: true,
        message: 'No cart found for user',
        data: {
          id: null,
          userId,
          items: [],
          totalItems: 0,
          totalAmount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    // Calculate totals using product prices
    const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum: number, item: any) => {
      const price = item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);

    const cartWithTotals = {
      ...cart,
      items: cartItems,
      totalItems,
      totalAmount
    };

    return NextResponse.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cartWithTotals
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch cart'
    }, { status: 500 });
  }
}

// Wrap with aggressive MongoDB cleanup
export async function GET(request: NextRequest) {
  return withMongoCleanup(handleGET, request);
}