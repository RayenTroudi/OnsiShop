import { connectionMonitor, withConnectionMonitoring } from '@/lib/connectionMonitor';
import { checkMongoDBHealth } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/system/connections - Check MongoDB connection status
export async function GET(request: NextRequest) {
  return withConnectionMonitoring(async () => {
    try {
      const health = await connectionMonitor.checkConnectionHealth();
      const status = connectionMonitor.getStatus();
      const isHealthy = await checkMongoDBHealth();
      
      return NextResponse.json({
        mongodb: {
          healthy: isHealthy,
          connections: {
            current: health.count,
            max: status.maxConnections,
            status: health.status,
            message: health.message
          },
          cleanup: {
            lastCleanup: status.lastCleanup,
            nextScheduledCleanup: status.nextCleanup
          }
        },
        timestamp: new Date().toISOString(),
        success: true
      });
    } catch (error) {
      console.error('Error checking system status:', error);
      return NextResponse.json(
        { 
          error: 'Failed to check system status',
          mongodb: { healthy: false },
          success: false 
        },
        { status: 500 }
      );
    }
  }, 'GET /api/system/connections');
}

// POST /api/system/connections - Force cleanup connections
export async function POST(request: NextRequest) {
  return withConnectionMonitoring(async () => {
    try {
      const body = await request.json();
      
      if (body.action === 'cleanup') {
        await connectionMonitor.forceCleanup();
        
        // Wait a moment and check new status
        await new Promise(resolve => setTimeout(resolve, 1000));
        const health = await connectionMonitor.checkConnectionHealth();
        
        return NextResponse.json({
          message: 'Connection cleanup completed',
          connections: {
            current: health.count,
            status: health.status,
            message: health.message
          },
          timestamp: new Date().toISOString(),
          success: true
        });
      }
      
      return NextResponse.json(
        { error: 'Invalid action. Use {"action": "cleanup"}' },
        { status: 400 }
      );
    } catch (error) {
      console.error('Error performing connection action:', error);
      return NextResponse.json(
        { 
          error: 'Failed to perform connection action',
          success: false 
        },
        { status: 500 }
      );
    }
  }, 'POST /api/system/connections');
}