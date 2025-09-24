/**
 * MongoDB Connection Monitor
 * Tracks and manages database connections for M0 cluster limits
 */

import { cleanupConnections, getConnectionCount } from './mongodb';

class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private connectionCount = 0;
  private lastCleanup = Date.now();
  private readonly MAX_CONNECTIONS = 15; // Even more conservative for M0 (was 20)
  private readonly CLEANUP_INTERVAL = 2 * 60 * 1000; // Every 2 minutes (was 5)
  private readonly WARNING_THRESHOLD = 10; // Warn earlier (was 15)

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  async checkConnectionHealth(): Promise<{
    count: number;
    status: 'healthy' | 'warning' | 'critical';
    message: string;
  }> {
    try {
      const count = await getConnectionCount();
      this.connectionCount = count;

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let message = `${count} connections active`;

      if (count >= this.MAX_CONNECTIONS) {
        status = 'critical';
        message = `🚨 CRITICAL: ${count} connections (limit: 25). Cleaning up...`;
        await this.forceCleanup();
      } else if (count >= this.WARNING_THRESHOLD) {
        status = 'warning';
        message = `⚠️ WARNING: ${count} connections approaching limit (25)`;
      }

      // Auto cleanup every 5 minutes
      if (Date.now() - this.lastCleanup > this.CLEANUP_INTERVAL) {
        await this.scheduleCleanup();
      }

      return { count, status, message };
    } catch (error) {
      console.error('Connection health check failed:', error);
      return { 
        count: -1, 
        status: 'critical', 
        message: 'Unable to check connection status' 
      };
    }
  }

  async forceCleanup(): Promise<void> {
    console.log('🧹 Force cleaning up MongoDB connections...');
    await cleanupConnections();
    this.lastCleanup = Date.now();
  }

  async scheduleCleanup(): Promise<void> {
    console.log('⏰ Scheduled MongoDB connection cleanup...');
    await cleanupConnections();
    this.lastCleanup = Date.now();
  }

  getStatus(): { 
    connectionCount: number; 
    maxConnections: number; 
    lastCleanup: Date;
    nextCleanup: Date;
  } {
    return {
      connectionCount: this.connectionCount,
      maxConnections: this.MAX_CONNECTIONS,
      lastCleanup: new Date(this.lastCleanup),
      nextCleanup: new Date(this.lastCleanup + this.CLEANUP_INTERVAL)
    };
  }
}

export const connectionMonitor = ConnectionMonitor.getInstance();

// Middleware for API routes to monitor connections
export async function withConnectionMonitoring<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  const startTime = Date.now();
  
  try {
    // Check connection health before operation
    const health = await connectionMonitor.checkConnectionHealth();
    
    if (health.status === 'critical') {
      console.error(`🚨 Connection critical before ${context}:`, health.message);
    } else if (health.status === 'warning') {
      console.warn(`⚠️ Connection warning before ${context}:`, health.message);
    }

    // Execute the operation
    const result = await operation();
    
    const duration = Date.now() - startTime;
    if (duration > 5000) { // Log slow operations
      console.warn(`⏱️ Slow operation ${context}: ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Operation failed ${context} (${duration}ms):`, error);
    
    // Check if it's a connection error and force cleanup
    if (error instanceof Error && error.message.includes('connection')) {
      console.log('🧹 Connection error detected, forcing cleanup...');
      await connectionMonitor.forceCleanup();
    }
    
    throw error;
  }
}

// Helper to log connection status
export async function logConnectionStatus(context: string): Promise<void> {
  try {
    const health = await connectionMonitor.checkConnectionHealth();
    const status = connectionMonitor.getStatus();
    
    console.log(`📊 ${context} Connection Status:`, {
      current: health.count,
      max: status.maxConnections,
      status: health.status,
      message: health.message,
      lastCleanup: status.lastCleanup.toLocaleTimeString()
    });
  } catch (error) {
    console.error('Failed to log connection status:', error);
  }
}

export default connectionMonitor;