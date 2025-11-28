import { verifyAuth } from '@/lib/appwrite/auth';
import { dbService } from '@/lib/appwrite/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/cart/add - Add a product to cart (increase qty if already there)
export async function POST(request: NextRequest) {
  let userId: string = '';
  let productId: string = '';
  let quantity: number = 1;
  let variantId: string | undefined = undefined;
  
  try {
    // Get user from Appwrite session
    const user = await verifyAuth();
    
    console.log('🍪 Cart Add API Debug:', {
      hasUser: !!user,
      userId: user?.id,
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    if (!user) {
      console.log('🚫 No auth user found in cart add API');
      return NextResponse.json({
        success: false,
        message: 'Please log in to add items to cart'
      }, { status: 401 });
    }

    userId = user.id;
    console.log('✅ User verified successfully, userId:', userId);

    const body = await request.json();
    productId = body.productId;
    quantity = body.quantity || 1;
    variantId = body.variantId;

    console.log('🛒 Cart Add Request:', {
      userId: userId || 'MISSING',
      productId: productId || 'MISSING',
      quantity,
      variantId: variantId || 'undefined',
      bodyKeys: Object.keys(body)
    });

    // Handle the case where variantId is the string "undefined"
    if (variantId === 'undefined' || variantId === '') {
      variantId = undefined;
    }

    if (!productId) {
      console.log('🚨 Cart Add Validation Failed:', {
        userId: !!userId,
        productId: !!productId,
        receivedBody: body
      });
      return NextResponse.json({
        success: false,
        message: 'Product ID is required'
      }, { status: 400 });
    }

    // Check if product exists and has enough stock
    const product = await dbService.getProductById(productId ) as any;

    if (!product) {
      return NextResponse.json({
        success: false,
        message: 'Product not found'
      }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} items available`
      }, { status: 400 });
    }

    // Ensure user exists (create if not exists for demo purposes)
    let userRecord = await dbService.getUserById(userId );

    if (!userRecord) {
      userRecord = await dbService.createUser({
        name: 'Demo User',
        email: `${userId}@demo.com`,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Get or create cart
    let cart = await dbService.getCartByUserId(userId);

    if (!cart) {
      cart = await dbService.createCart({ userId });
    }

    // Check if item already exists in cart
    const cartItems = await dbService.getCartItems(cart.id);
    const existingItem = cartItems.find((item: any) => 
      item.productId === productId && (item.variantId || null) === (variantId || null)
    );

    let cartItem;
    if (existingItem) {
      const newQuantity = (existingItem as any).quantity + quantity;
      
      // Check stock again for the new total quantity
      if (product.stock < newQuantity) {
        return NextResponse.json({
          success: false,
          message: `Cannot add ${quantity} more items. Only ${product.stock - (existingItem as any).quantity} more available`
        }, { status: 400 });
      }

      cartItem = await dbService.updateCartItem((existingItem as any).id, { quantity: newQuantity });
    } else {
      cartItem = await dbService.createCartItem({
        cartId: cart.id,
        productId,
        quantity,
        variantId: variantId || undefined
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Product added to cart successfully',
      data: cartItem
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      userId: userId || 'undefined',
      productId: productId || 'undefined',
      quantity: quantity || 'undefined',
      variantId: variantId || 'undefined'
    });
    
    return NextResponse.json({
      success: false,
      message: 'Failed to add product to cart',
      error: errorMessage
    }, { status: 500 });
  }
}
