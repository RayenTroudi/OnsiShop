// This file is deprecated - use @/lib/appwrite/auth instead
// All authentication now handled by Appwrite Account API

import { verifyAuth as appwriteVerifyAuth } from '@/lib/appwrite/auth';
import { NextRequest, NextResponse } from 'next/server';

export function authMiddleware(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      const user = await appwriteVerifyAuth();

      if (!user) {
        return NextResponse.json({
          success: false,
          message: 'Authentication required'
        }, { status: 401 });
      }
      
      // Add user info to request
      (request as any).user = user;

      return handler(request, ...args);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired session'
      }, { status: 401 });
    }
  };
}

// Simple auth check function
export function requireAuth(userId?: string) {
  if (!userId) {
    throw new Error('Authentication required');
  }
  return userId;
}
