import { dbService } from '@/lib/appwrite/database';
import { ID, serverAccount } from '@/lib/appwrite/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔍 Registration API called');
  
  try {
    const { email, password, name } = await request.json();
    console.log('📝 Registration data:', { email, name, passwordLength: password?.length });

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists in database
    console.log('🔍 Checking if user exists:', email);
    const existingUser = await dbService.getUserByEmail(email);

    if (existingUser) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create Appwrite account
    console.log('👤 Creating Appwrite account');
    const userId = ID.unique();
    const displayName = name || email.split('@')[0];
    
    const account = await serverAccount.create(
      userId,
      email,
      password,
      displayName
    );
    console.log('✅ Appwrite account created:', account.$id);

    // Create user document in database
    console.log('📄 Creating user document');
    const user = await dbService.createUser({
      accountId: account.$id,
      email: account.email,
      name: displayName,
      role: 'user', // All new registrations are normal users
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    console.log('✅ User document created:', user.id);

    // Create session
    const session = await serverAccount.createEmailPasswordSession(email, password);

    const response = NextResponse.json({
      message: 'Registration successful',
      user: {
        id: user.id,
        email: (user as any).email,
        name: (user as any).name,
        isAdmin: (user as any).role === 'admin',
      },
    });

    // Appwrite handles session cookies automatically via SDK
    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle Appwrite-specific errors
    if (error.code === 409) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
