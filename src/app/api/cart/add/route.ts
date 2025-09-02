import { prisma } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/cart/add - Add a product to cart (increase qty if already there)
export async function POST(request: NextRequest) {
  let userId: string = '';
  let productId: string = '';
  let quantity: number = 1;
  let variantId: string | undefined = undefined;
  
  try {
    const body = await request.json();
    userId = body.userId;
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

    if (!userId || !productId) {
      console.log('🚨 Cart Add Validation Failed:', {
        userId: !!userId,
        productId: !!productId,
        receivedBody: body
      });
      return NextResponse.json({
        success: false,
        message: 'User ID and Product ID are required'
      }, { status: 400 });
    }

    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId }
    }) as any;

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
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          name: 'Demo User',
          email: `${userId}@demo.com`,
          password: 'demo_password',
          role: 'user'
        }
      });
    }

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null
      }
    });

    let cartItem;
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      // Check stock again for the new total quantity
      if (product.stock < newQuantity) {
        return NextResponse.json({
          success: false,
          message: `Cannot add ${quantity} more items. Only ${product.stock - existingItem.quantity} more available`
        }, { status: 400 });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          variantId: variantId || null
        },
        include: { product: true }
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
