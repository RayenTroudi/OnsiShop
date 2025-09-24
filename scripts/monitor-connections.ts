/**
 * MongoDB Connection Health Monitor Script
 * 
 * This script monitors MongoDB connections and provides automatic cleanup
 * for M0 cluster connection limit issues
 */

import * as dotenv from 'dotenv';
import { connectionMonitor } from '../src/lib/connectionMonitor';
import { checkMongoDBHealth, cleanupConnections } from '../src/lib/mongodb';

// Load environment variables
dotenv.config({ path: '.env.local' });

class ConnectionHealthMonitor {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly MONITOR_INTERVAL = 30000; // Check every 30 seconds

  async start() {
    if (this.isRunning) {
      console.log('📊 Connection monitor is already running');
      return;
    }

    console.log('🚀 Starting MongoDB Connection Health Monitor...\n');
    this.isRunning = true;

    // Initial health check
    await this.performHealthCheck();

    // Start periodic monitoring
    this.intervalId = setInterval(async () => {
      await this.performHealthCheck();
    }, this.MONITOR_INTERVAL);

    console.log(`👀 Monitoring started - checking every ${this.MONITOR_INTERVAL / 1000} seconds`);
    console.log('Press Ctrl+C to stop monitoring\n');
  }

  async stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ Connection monitoring stopped');
  }

  private async performHealthCheck() {
    try {
      const timestamp = new Date().toLocaleString();
      const isHealthy = await checkMongoDBHealth();
      
      if (!isHealthy) {
        console.log(`❌ [${timestamp}] MongoDB is not responding`);
        return;
      }

      const health = await connectionMonitor.checkConnectionHealth();
      const status = connectionMonitor.getStatus();

      // Color code the status
      let statusIcon = '✅';
      let statusColor = '';
      
      if (health.status === 'critical') {
        statusIcon = '🚨';
        statusColor = '\x1b[31m'; // Red
      } else if (health.status === 'warning') {
        statusIcon = '⚠️';
        statusColor = '\x1b[33m'; // Yellow
      } else {
        statusColor = '\x1b[32m'; // Green
      }

      console.log(`${statusIcon} [${timestamp}] ${statusColor}${health.message}\x1b[0m`);
      
      if (health.status === 'critical') {
        console.log('  🧹 Automatic cleanup triggered...');
        await this.forceCleanupAndReport();
      } else if (health.status === 'warning') {
        console.log('  📊 Connection Status:');
        console.log(`     Current: ${health.count}/${status.maxConnections}`);
        console.log(`     Last Cleanup: ${status.lastCleanup.toLocaleTimeString()}`);
      }

      // Log detailed status every 5 minutes
      if (Date.now() % (5 * 60 * 1000) < this.MONITOR_INTERVAL) {
        await this.logDetailedStatus();
      }

    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  private async forceCleanupAndReport() {
    try {
      await connectionMonitor.forceCleanup();
      
      // Wait a bit for cleanup to take effect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newHealth = await connectionMonitor.checkConnectionHealth();
      console.log(`  ✅ Cleanup complete. New status: ${newHealth.count} connections (${newHealth.status})`);
      
    } catch (error) {
      console.error('  ❌ Cleanup failed:', error);
    }
  }

  private async logDetailedStatus() {
    try {
      const health = await connectionMonitor.checkConnectionHealth();
      const status = connectionMonitor.getStatus();
      
      console.log('\n📊 Detailed Connection Report:');
      console.log('  ================================');
      console.log(`  Current Connections: ${health.count}`);
      console.log(`  Maximum Allowed: ${status.maxConnections}`);
      console.log(`  Status: ${health.status.toUpperCase()}`);
      console.log(`  Last Cleanup: ${status.lastCleanup.toLocaleString()}`);
      console.log(`  Next Scheduled: ${status.nextCleanup.toLocaleString()}`);
      console.log(`  MongoDB Health: ${await checkMongoDBHealth() ? 'HEALTHY' : 'UNHEALTHY'}`);
      console.log('  ================================\n');
      
    } catch (error) {
      console.error('Failed to get detailed status:', error);
    }
  }
}

// Test connection and cleanup functionality
async function runTests() {
  console.log('🧪 Running MongoDB connection tests...\n');
  
  try {
    // Test 1: Basic health check
    console.log('Test 1: Basic MongoDB health check');
    const isHealthy = await checkMongoDBHealth();
    console.log(`  Result: ${isHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}\n`);
    
    // Test 2: Connection count
    console.log('Test 2: Connection status check');
    const health = await connectionMonitor.checkConnectionHealth();
    console.log(`  Current connections: ${health.count}`);
    console.log(`  Status: ${health.status}`);
    console.log(`  Message: ${health.message}\n`);
    
    // Test 3: Manual cleanup
    console.log('Test 3: Manual connection cleanup');
    await connectionMonitor.forceCleanup();
    
    // Wait and check again
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newHealth = await connectionMonitor.checkConnectionHealth();
    console.log(`  After cleanup: ${newHealth.count} connections (${newHealth.status})\n`);
    
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Tests failed:', error);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'monitor';
  
  console.log('🔗 MongoDB Connection Health Tool\n');
  
  try {
    switch (command) {
      case 'test':
        await runTests();
        break;
        
      case 'cleanup':
        console.log('🧹 Running manual connection cleanup...');
        await cleanupConnections();
        const health = await connectionMonitor.checkConnectionHealth();
        console.log(`✅ Cleanup complete. Status: ${health.count} connections (${health.status})`);
        break;
        
      case 'status':
        const currentHealth = await connectionMonitor.checkConnectionHealth();
        const status = connectionMonitor.getStatus();
        console.log('📊 Current MongoDB Connection Status:');
        console.log(`  Connections: ${currentHealth.count}/${status.maxConnections}`);
        console.log(`  Status: ${currentHealth.status.toUpperCase()}`);
        console.log(`  Message: ${currentHealth.message}`);
        console.log(`  MongoDB Health: ${await checkMongoDBHealth() ? 'HEALTHY' : 'UNHEALTHY'}`);
        break;
        
      case 'monitor':
      default:
        const monitor = new ConnectionHealthMonitor();
        
        // Handle Ctrl+C gracefully
        process.on('SIGINT', async () => {
          console.log('\n\n🛑 Stopping monitor...');
          await monitor.stop();
          process.exit(0);
        });
        
        await monitor.start();
        
        // Keep the process running
        await new Promise(() => {}); // Infinite promise
        break;
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Show usage if --help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🔗 MongoDB Connection Health Tool

Usage: npx tsx scripts/monitor-connections.ts [command]

Commands:
  monitor    Start continuous connection monitoring (default)
  test       Run connection tests and diagnostics  
  cleanup    Force cleanup all idle connections
  status     Check current connection status
  
Options:
  --help, -h  Show this help message

Examples:
  npx tsx scripts/monitor-connections.ts
  npx tsx scripts/monitor-connections.ts test
  npx tsx scripts/monitor-connections.ts cleanup
  npx tsx scripts/monitor-connections.ts status
`);
  process.exit(0);
}

// Run the main function
main().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});

export { ConnectionHealthMonitor };
