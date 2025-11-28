import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  accountId: string;
  email: string;
  name: string;
  role: string;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here-change-in-production'
);

/**
 * Verify current user authentication via JWT token
 * Returns user data if authenticated, null otherwise
 */
export async function verifyAuth(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      console.log('❌ No auth token found');
      return null;
    }
    
    // Verify JWT token
    const { payload } = await jwtVerify(token.value, JWT_SECRET);
    
    console.log('✅ Token verified for user:', payload.email);
    
    return {
      id: payload.userId as string,
      accountId: payload.accountId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch (error) {
    console.error('❌ Auth verification failed:', error);
    return null;
  }
}

/**
 * Require authentication middleware
 * Returns user or throws error
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await verifyAuth();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

/**
 * Require admin authentication
 * Returns admin user or throws error
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  
  return user;
}

/**
 * Get current authenticated user (for client components)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  return await verifyAuth();
}
