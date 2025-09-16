import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export function authMiddleware(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');

      if (!token) {
        return NextResponse.json({
          success: false,
          message: 'Authentication required'
        }, { status: 401 });
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      
      // Add user info to request (in a real app, you'd attach this properly)
      (request as any).user = decoded;

      return handler(request, ...args);
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token'
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
