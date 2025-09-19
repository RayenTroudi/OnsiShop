import { dbService } from '@/lib/database';
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
    let user = await dbService.getUserById(userId );

    if (!user) {
      user = await dbService.createUser({
        name: 'Demo User',
        email: `${userId}@demo.com`,
        password: 'demo_password',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Check if user already has a cart
    let cart = await dbService.getCartByUserId(userId);

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await dbService.createCart({ userId, createdAt: new Date(), updatedAt: new Date() });
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
