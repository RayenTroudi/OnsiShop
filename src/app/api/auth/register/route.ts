import { dbService } from '@/lib/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  console.log('🔍 Registration API called');
  
  try {
    const { email, password } = await request.json();
    console.log('📝 Registration data:', { email, passwordLength: password?.length });

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists:', email);
    const existingUser = await dbService.getUserByEmail(email);

    if (existingUser) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    console.log('🔐 Hashing password');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user as normal user (not admin)
    console.log('👤 Creating new user');
    const user = await dbService.createUser({
      email,
      password: hashedPassword,
      name: email.split('@')[0], // Use email prefix as name
      role: 'user', // All new registrations are normal users
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ User created successfully:', user.id);

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        name: user.name,
        isAdmin: user.role === 'admin' 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    const response = NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.role === 'admin',
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
