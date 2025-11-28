// This route is deprecated - use Appwrite Account API for user creation
// Users must be created through:
// 1. Appwrite Console (https://cloud.appwrite.io)
// 2. Registration endpoint (/api/auth/register)
// 3. Migration script (scripts/appwrite/migrate-data.ts)

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: 'This endpoint is deprecated',
      message: 'Use Appwrite Account API or registration endpoint to create users'
    },
    { status: 410 }
  );
}

export async function GET(request: NextRequest) {
  return POST(request);
}