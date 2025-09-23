import { getCircuitBreakerStatus, performHealthCheck, resetCircuitBreaker } from '@/lib/enhanced-db';
import { connectToDatabase } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Health check endpoint
export async function GET() {
  try {
    const startTime = Date.now();
    
    // Get circuit breaker status
    const circuitBreakerStatus = getCircuitBreakerStatus();
    
    // Perform database health check
    const dbHealthy = await performHealthCheck();
    
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: dbHealthy,
        circuitBreaker: {
          state: circuitBreakerStatus.state,
          failures: circuitBreakerStatus.failures,
          lastFailureTime: circuitBreakerStatus.lastFailureTime ? 
            new Date(circuitBreakerStatus.lastFailureTime).toISOString() : null
        }
      },
      services: {
        mongodb: dbHealthy ? 'up' : 'down',
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
          connected: false,
          circuitBreaker: getCircuitBreakerStatus()
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
      resetCircuitBreaker();
      console.log('🔄 Circuit breaker manually reset by admin');
      
      return NextResponse.json({
        success: true,
        message: 'Circuit breaker reset successfully',
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
    
    // Detailed MongoDB connection test
    let connectionDetails = null;
    let collectionsInfo = null;
    
    try {
      const { client, db } = await connectToDatabase();
      
      // Test basic connection
      const adminDb = client.db().admin();
      const serverStatus = await adminDb.serverStatus();
      
      // Get collection stats
      const collections = await db.listCollections().toArray();
      collectionsInfo = collections.map(col => col.name);
      
      connectionDetails = {
        serverStatus: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections
        },
        collections: collectionsInfo,
        databaseName: db.databaseName
      };
      
    } catch (dbError) {
      console.error('Database detailed check failed:', dbError);
    }
    
    const responseTime = Date.now() - startTime;
    const circuitBreakerStatus = getCircuitBreakerStatus();
    
    return NextResponse.json({
      status: connectionDetails ? 'detailed-healthy' : 'detailed-unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      circuitBreaker: circuitBreakerStatus,
      mongodb: connectionDetails,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
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