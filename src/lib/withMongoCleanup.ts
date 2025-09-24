/**
 * MongoDB Connection Cleanup Middleware
 * ULTRA-aggressive cleanup for M0 cluster limits
 */

import { cleanupConnections } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function withMongoCleanup<T = any>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>,
  req: NextRequest
): Promise<NextResponse<T>> {
  console.log('🔄 API call started:', req.method, req.nextUrl.pathname);
  
  try {
    // Execute the API handler
    const response = await handler(req);
    
    console.log('✅ API call completed successfully');
    
    // IMMEDIATE cleanup after successful API calls (critical for M0)
    setTimeout(async () => {
      try {
        await cleanupConnections();
        console.log('🧹 FORCED cleanup after successful API call');
      } catch (error) {
        console.warn('⚠️ Post-API cleanup failed:', error);
      }
    }, 50); // Cleanup after just 50ms
    
    return response;
  } catch (error) {
    console.error('❌ API call failed:', error);
    
    // IMMEDIATE force cleanup on errors (might be connection-related)
    setTimeout(async () => {
      try {
        await cleanupConnections();
        console.log('🧹 EMERGENCY cleanup after API error');
      } catch (cleanupError) {
        console.warn('⚠️ Emergency cleanup failed:', cleanupError);
      }
    }, 10); // Emergency cleanup after just 10ms
    
    throw error;
  }
}

// Helper function to wrap API route handlers
export function withConnectionCleanup<T>(
  handler: (req: NextRequest) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    return withMongoCleanup(handler, req);
  };
}

export default withConnectionCleanup;