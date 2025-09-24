#!/usr/bin/env node

/**
 * Emergency MongoDB Connection Cleanup Script
 * Run this immediately to reduce connection count for M0 cluster
 */

import * as dotenv from 'dotenv';
import { checkMongoDBHealth, cleanupConnections, getConnectionCount } from '../src/lib/mongodb.ts';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function emergencyCleanup() {
  console.log('🚨 Emergency MongoDB Connection Cleanup\n');
  
  try {
    // Check current status
    console.log('📊 Checking current connection status...');
    const isHealthy = await checkMongoDBHealth();
    const currentCount = await getConnectionCount();
    
    console.log(`Current Status:
  - MongoDB Health: ${isHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}
  - Connections: ${currentCount} / 25 (M0 limit)
  - Status: ${currentCount > 20 ? '🚨 CRITICAL' : currentCount > 15 ? '⚠️ WARNING' : '✅ OK'}
`);

    if (currentCount > 15) {
      console.log('🧹 Running emergency cleanup...');
      await cleanupConnections();
      
      // Wait for cleanup to take effect
      console.log('⏳ Waiting for cleanup to take effect...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check new status
      const newCount = await getConnectionCount();
      console.log(`📊 After cleanup:
  - Previous: ${currentCount} connections
  - Current: ${newCount} connections
  - Reduction: ${currentCount - newCount} connections closed
`);
      
      if (newCount < currentCount) {
        console.log('✅ Cleanup successful!');
      } else {
        console.log('⚠️ Cleanup may not have been fully effective');
      }
      
    } else {
      console.log('✅ Connection count is within safe limits, no cleanup needed.');
    }
    
    console.log('\n📋 Recommended actions:');
    console.log('1. Restart your application: npm run dev');
    console.log('2. Monitor connections: npx tsx scripts/monitor-connections.ts');
    console.log('3. Check MongoDB Atlas dashboard for connection metrics');
    
  } catch (error) {
    console.error('❌ Emergency cleanup failed:', error);
    console.log('\n🔧 Manual steps to try:');
    console.log('1. Restart your development server (Ctrl+C then npm run dev)');
    console.log('2. Check MongoDB Atlas connection count in your dashboard');
    console.log('3. Consider upgrading to M10+ cluster for more connections');
  }
}

// Show help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🚨 Emergency MongoDB Connection Cleanup

This script immediately cleans up MongoDB connections for M0 clusters
experiencing connection limit issues.

Usage:
  node scripts/emergency-cleanup.js
  npm run cleanup:emergency

What it does:
  1. Checks current connection count
  2. Forces cleanup of idle connections  
  3. Reports before/after connection counts
  4. Provides next steps

For M0 clusters (free tier):
  - Maximum: 25 connections
  - Recommended max: 15 connections  
  - Critical threshold: 20+ connections
`);
  process.exit(0);
}

// Run the cleanup
emergencyCleanup()
  .then(() => {
    console.log('\n🎉 Emergency cleanup completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Emergency cleanup failed:', error);
    process.exit(1);
  });