// This file is deprecated - use @/lib/appwrite/auth instead
// All authentication now handled by Appwrite Account API

export { requireAdmin, requireAuth, verifyAuth } from '@/lib/appwrite/auth';

// Legacy exports for backwards compatibility
import { verifyAuth as appwriteVerifyAuth } from '@/lib/appwrite/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function verifyAuthLegacy(request: NextRequest) {
  return await appwriteVerifyAuth();
}

export async function requireAuthLegacy(request: NextRequest) {
  const user = await appwriteVerifyAuth();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return user;
}

export async function requireAdminLegacy(request: NextRequest) {
  const user = await appwriteVerifyAuth();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  return user;
}
