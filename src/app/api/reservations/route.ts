import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      street,
      city,
      zipCode,
      country,
      notes,
      cartItems,
      totalAmount
    } = body;

    // Validate required fields
    if (!fullName || !email || !phone || !street || !city || !zipCode || !country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart items are required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        fullName,
        email,
        phone,
        street,
        city,
        zipCode,
        country,
        notes: notes || null,
        totalAmount: parseFloat(totalAmount),
        items: JSON.stringify(cartItems),
        status: 'pending'
      }
    });

    // Clear user's cart after successful reservation
    try {
      const userCart = await prisma.cart.findFirst({
        where: { userId }
      });
      
      if (userCart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: userCart.id }
        });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Don't fail the reservation if cart clearing fails
    }

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      message: 'Reservation created successfully'
    });

  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user's reservations
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Parse items JSON for each reservation
    const reservationsWithItems = reservations.map(reservation => ({
      ...reservation,
      items: JSON.parse(reservation.items)
    }));

    return NextResponse.json({
      success: true,
      reservations: reservationsWithItems
    });

  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
