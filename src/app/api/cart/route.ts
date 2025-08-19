import { prisma } from '@/lib/database';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Get cart for current user/session
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const cartId = cookieStore.get('cartId')?.value;
    
    if (!cartId) {
      return NextResponse.json({ items: [], totalQuantity: 0, cost: { totalAmount: { amount: '0', currencyCode: 'USD' } } });
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

    if (!cart) {
      return NextResponse.json({ items: [], totalQuantity: 0, cost: { totalAmount: { amount: '0', currencyCode: 'USD' } } });
    }

    // Transform to match Shopify cart format
    const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const transformedCart = {
      id: cart.id,
      lines: cart.items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        cost: {
          totalAmount: {
            amount: (item.product.price * item.quantity).toString(),
            currencyCode: 'USD'
          }
        },
        merchandise: {
          id: item.product.id,
          title: 'Default',
          selectedOptions: [],
          product: {
            id: item.product.id,
            handle: item.product.handle,
            title: item.product.title,
            featuredImage: {
              url: item.product.images ? JSON.parse(item.product.images)[0] || '/images/placeholder.jpg' : '/images/placeholder.jpg',
              altText: item.product.title
            }
          }
        }
      })),
      totalQuantity,
      cost: {
        totalAmount: {
          amount: totalAmount.toString(),
          currencyCode: 'USD'
        },
        totalTaxAmount: {
          amount: (totalAmount * 0.1).toString(), // 10% tax
          currencyCode: 'USD'
        }
      },
      checkoutUrl: `/checkout/${cart.id}`
    };

    return NextResponse.json(transformedCart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { productId, quantity = 1, variantId } = await request.json();
    const cookieStore = cookies();
    let cartId = cookieStore.get('cartId')?.value;

    // Create cart if it doesn't exist
    if (!cartId) {
      const newCart = await prisma.cart.create({
        data: {
          sessionId: `session_${Date.now()}`
        }
      });
      cartId = newCart.id;
      
      // Set cart cookie
      const response = NextResponse.json({ success: true, cartId });
      response.cookies.set('cartId', cartId, { 
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId,
          productId,
          variantId: variantId || null
        }
      }
    });

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // Create new cart item
      await prisma.cartItem.create({
        data: {
          cartId,
          productId,
          quantity,
          variantId
        }
      });
    }

    const response = NextResponse.json({ success: true });
    if (!cookieStore.get('cartId')?.value) {
      response.cookies.set('cartId', cartId, { 
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
    }

    return response;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}