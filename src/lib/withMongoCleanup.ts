/**
 * Cleanup Middleware (Deprecated)
 * Appwrite handles cleanup automatically
 */

import { NextRequest, NextResponse } from 'next/server';

export async function withMongoCleanup(
  handler: (req: NextRequest) => Promise<NextResponse<any>>,
  req: NextRequest
): Promise<NextResponse<any>> {
  console.log('🔄 API call started:', req.method, req.nextUrl.pathname);
  
  try {
    // Execute the API handler
    const response = await handler(req);
    
    console.log('✅ API call completed successfully');
    
    return response;
  } catch (error) {
    console.error('❌ API call failed:', error);
    
    // No cleanup needed with Appwrite
    setTimeout(async () => {
      console.log('🧹 Cleanup not needed with Appwrite');
    }, 10);
    
    throw error;
  }
}

// Helper function to wrap API route handlers
export function withConnectionCleanup(
  handler: (req: NextRequest) => Promise<NextResponse<any>>
) {
  return async (req: NextRequest): Promise<NextResponse<any>> => {
    return withMongoCleanup(handler, req);
  };
}

export default withConnectionCleanup;