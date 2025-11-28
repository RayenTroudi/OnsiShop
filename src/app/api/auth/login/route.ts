import { appwriteConfig } from '@/lib/appwrite/config';
import { dbService } from '@/lib/appwrite/database';
import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { Account, Client } from 'node-appwrite';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create Appwrite session (Appwrite handles password verification)
    try {
      // Create a session client
      const client = new Client()
        .setEndpoint(appwriteConfig.endpoint)
        .setProject(appwriteConfig.projectId);
      
      const account = new Account(client);
      const session = await account.createEmailPasswordSession(email, password);
      
      console.log('✅ Session created:', {
        sessionId: session.$id,
        userId: session.userId,
        expire: session.expire,
      });
      
      // Fetch user document from database
      const user = await dbService.getUserByEmail(email) as any;

      if (!user) {
        return NextResponse.json(
          { error: 'User data not found' },
          { status: 404 }
        );
      }

      // Create JWT token with user data
      const token = await new SignJWT({
        userId: user.id,
        accountId: user.accountId,
        email: user.email,
        name: user.name,
        role: user.role,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1y')
        .setIssuedAt()
        .sign(JWT_SECRET);

      const response = NextResponse.json({
        message: 'Login successful',
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.role === 'admin',
        },
      });

      // Set JWT token cookie
      response.cookies.set({
        name: 'auth-token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });

      // Also set Appwrite session cookie for potential direct Appwrite API calls
      response.cookies.set({
        name: `a_session_${appwriteConfig.projectId.toLowerCase()}`,
        value: session.$id,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });

      console.log('✅ Login successful, cookies set');
      return response;
    } catch (authError: any) {
      console.error('Auth error:', authError);
      // Invalid credentials
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
