import { serverDatabases } from '@/lib/appwrite/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Health check endpoint
export async function GET() {
  try {
    const startTime = Date.now();
    
    // Perform Appwrite health check
    let dbHealthy = false;
    try {
      await serverDatabases.list();
      dbHealthy = true;
    } catch (error) {
      console.error('Appwrite health check failed:', error);
    }
    
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: dbHealthy
      },
      services: {
        appwrite: dbHealthy ? 'up' : 'down',
        uploadthing: 'external', // We can't easily check UploadThing health
        api: 'up'
      }
    };
    
    console.log('🏥 Health check completed:', healthStatus);
    
    return NextResponse.json(healthStatus, {
      status: dbHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        database: {
          connected: false
        }
      },
      { status: 500 }
    );
  }
}

// POST - Reset circuit breaker (admin only)
export async function POST(request: NextRequest) {
  try {
    const { action, adminKey } = await request.json();
    
    // Simple admin key check (you might want to use proper auth)
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (action === 'reset-circuit-breaker') {
      // Circuit breaker not applicable with Appwrite
      console.log('🔄 Circuit breaker reset requested (N/A for Appwrite)');
      
      return NextResponse.json({
        success: true,
        message: 'Action acknowledged (not applicable with Appwrite)',
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('❌ Health check admin action failed:', error);
    return NextResponse.json(
      { error: 'Failed to execute admin action' },
      { status: 500 }
    );
  }
}

// Advanced health check with detailed connection info
export async function PUT() {
  try {
    const startTime = Date.now();
    
    // Detailed Appwrite connection test
    let connectionDetails = null;
    
    try {
      const databases = await serverDatabases.list();
      
      connectionDetails = {
        databases: databases.total,
        service: 'Appwrite Cloud'
      };
      
    } catch (dbError) {
      console.error('Database detailed check failed:', dbError);
    }
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: connectionDetails ? 'detailed-healthy' : 'detailed-unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      appwrite: connectionDetails,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasAppwriteEndpoint: !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
        hasAppwriteProjectId: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
        hasUploadthingSecret: !!process.env.UPLOADTHING_SECRET,
        hasUploadthingAppId: !!process.env.UPLOADTHING_APP_ID
      }
    });
    
  } catch (error) {
    console.error('❌ Detailed health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'detailed-error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}