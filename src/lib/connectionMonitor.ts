/**
 * Connection Monitor (Deprecated)
 * Appwrite handles connections automatically
 */

// Deprecated - no longer needed with Appwrite

class ConnectionMonitor {
  private static instance: ConnectionMonitor;

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
      // Appwrite manages connections automatically
      return { 
        count: 0, 
        status: 'healthy', 
        message: 'Appwrite connection management (automatic)' 
      };
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
    // No-op - Appwrite manages connections
  }

  async scheduleCleanup(): Promise<void> {
    // No-op - Appwrite manages connections
  }

  getStatus(): { 
    connectionCount: number; 
    message: string;
  } {
    return {
      connectionCount: 0,
      message: 'Appwrite connection management (automatic)'
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
    
    // Check if it's a connection error
    if (error instanceof Error && error.message.includes('connection')) {
      console.log('🧹 Connection error detected, forcing cleanup...');
      // No cleanup needed with Appwrite
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
      status: health.status,
      message: health.message || status.message
    });
  } catch (error) {
    console.error('Failed to log connection status:', error);
  }
}

export default connectionMonitor;