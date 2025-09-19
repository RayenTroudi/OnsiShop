import { prisma } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/cart - Create a cart for a user if it doesn't exist
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
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

    // Check if user already has a cart
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cart
    });

  } catch (error) {
    console.error('Error creating/getting cart:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create or retrieve cart'
    }, { status: 500 });
  }
}
