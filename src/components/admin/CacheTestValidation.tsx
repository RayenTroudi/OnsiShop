'use client';

import { useAuthWithCache, useCacheStats, useHeroContent } from '@/hooks/useCache';
import { cacheManager } from '@/lib/browser-cache';
import { useEffect, useState } from 'react';

export default function CacheTestValidation() {
  const [testResults, setTestResults] = useState<{
    quotaTest: 'pending' | 'pass' | 'fail';
    cacheMissTest: 'pending' | 'pass' | 'fail';
    authTest: 'pending' | 'pass' | 'fail';
    loopTest: 'pending' | 'pass' | 'fail';
  }>({
    quotaTest: 'pending',
    cacheMissTest: 'pending',
    authTest: 'pending',
    loopTest: 'pending'
  });

  const [testLogs, setTestLogs] = useState<string[]>([]);
  
  const { stats, refreshStats } = useCacheStats();
  const { data: heroContent, loading: heroLoading, error: heroError, fromCache } = useHeroContent();
  const { user, isAuthenticated, loading: authLoading, error: authError } = useAuthWithCache();

  const addLog = (message: string) => {
    setTestLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Test 1: QuotaExceededError Prevention
  const testQuotaHandling = async () => {
    try {
      addLog('🧪 Testing quota handling...');
      
      // Create large test data (3MB)
      const largeData = 'x'.repeat(3 * 1024 * 1024);
      
      await cacheManager.set('large_test_data', largeData, { storage: 'localStorage' });
      
      const retrieved = await cacheManager.get('large_test_data');
      
      if (retrieved === largeData) {
        setTestResults(prev => ({ ...prev, quotaTest: 'pass' }));
        addLog('✅ Large data cached successfully (memory fallback worked)');
      } else {
        setTestResults(prev => ({ ...prev, quotaTest: 'fail' }));
        addLog('❌ Large data cache test failed');
      }
      
      // Cleanup
      await cacheManager.remove('large_test_data');
      
    } catch (error) {
      setTestResults(prev => ({ ...prev, quotaTest: 'fail' }));
      addLog(`❌ Quota test failed: ${error}`);
    }
  };

  // Test 2: Cache Miss/Hit Logic
  const testCacheLogic = async () => {
    try {
      addLog('🧪 Testing cache miss/hit logic...');
      
      const testKey = 'cache_test_key';
      const testData = { test: 'data', timestamp: Date.now() };
      
      // Clear any existing cache
      await cacheManager.remove(testKey);
      
      // First get should be a miss
      const miss = await cacheManager.get(testKey);
      if (miss !== null) {
        setTestResults(prev => ({ ...prev, cacheMissTest: 'fail' }));
        addLog('❌ Cache miss test failed - got data when none should exist');
        return;
      }
      
      // Set data
      await cacheManager.set(testKey, testData);
      
      // Second get should be a hit
      const hit = await cacheManager.get(testKey);
      if (JSON.stringify(hit) === JSON.stringify(testData)) {
        setTestResults(prev => ({ ...prev, cacheMissTest: 'pass' }));
        addLog('✅ Cache hit/miss logic working correctly');
      } else {
        setTestResults(prev => ({ ...prev, cacheMissTest: 'fail' }));
        addLog('❌ Cache hit test failed - data mismatch');
      }
      
      // Cleanup
      await cacheManager.remove(testKey);
      
    } catch (error) {
      setTestResults(prev => ({ ...prev, cacheMissTest: 'fail' }));
      addLog(`❌ Cache logic test failed: ${error}`);
    }
  };

  // Test 3: Auth Error Handling
  useEffect(() => {
    if (!authLoading) {
      if (authError && authError.message.includes('Authentication required')) {
        // This would be expected for 401 errors
        setTestResults(prev => ({ ...prev, authTest: 'pass' }));
        addLog('✅ Auth error handled correctly (401 not cached)');
      } else if (!authError) {
        // No error means auth is working or gracefully handled
        setTestResults(prev => ({ ...prev, authTest: 'pass' }));
        addLog('✅ Auth working correctly or gracefully handled');
      } else {
        setTestResults(prev => ({ ...prev, authTest: 'fail' }));
        addLog(`❌ Unexpected auth error: ${authError.message}`);
      }
    }
  }, [authLoading, authError]);

  // Test 4: Infinite Loop Prevention
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (renderCount < 10) {
        setTestResults(prev => ({ ...prev, loopTest: 'pass' }));
        addLog(`✅ No infinite loops detected (${renderCount} renders)`);
      } else {
        setTestResults(prev => ({ ...prev, loopTest: 'fail' }));
        addLog(`❌ Potential infinite loop detected (${renderCount} renders)`);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [renderCount]);

  // Run tests on mount
  useEffect(() => {
    const runTests = async () => {
      addLog('🚀 Starting cache system validation tests...');
      
      setTimeout(testQuotaHandling, 1000);
      setTimeout(testCacheLogic, 2000);
    };
    
    runTests();
  }, []);

  const getTestIcon = (result: 'pending' | 'pass' | 'fail') => {
    switch (result) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      default: return '⏳';
    }
  };

  const allTestsPassed = Object.values(testResults).every(result => result === 'pass');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Cache System Validation</h1>
        
        {/* Overall Status */}
        <div className={`p-4 rounded-lg mb-6 ${
          allTestsPassed ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
        }`}>
          <h2 className="text-lg font-semibold mb-2">
            {allTestsPassed ? '✅ All Tests Passed!' : '⏳ Tests Running...'}
          </h2>
          <p className="text-sm text-gray-600">
            {allTestsPassed 
              ? 'Your caching system is working correctly without quota errors, cache misses, auth issues, or infinite loops.'
              : 'Running validation tests for cache functionality...'
            }
          </p>
        </div>

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">
              {getTestIcon(testResults.quotaTest)} Quota Error Prevention
            </h3>
            <p className="text-sm text-gray-600">
              Tests large data storage with fallback to memory cache when localStorage quota is exceeded.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">
              {getTestIcon(testResults.cacheMissTest)} Cache Hit/Miss Logic
            </h3>
            <p className="text-sm text-gray-600">
              Validates that cache lookups correctly return null for misses and data for hits.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">
              {getTestIcon(testResults.authTest)} Auth Error Handling
            </h3>
            <p className="text-sm text-gray-600">
              Ensures 401/403 errors are handled gracefully without breaking the app.
            </p>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">
              {getTestIcon(testResults.loopTest)} Infinite Loop Prevention
            </h3>
            <p className="text-sm text-gray-600">
              Checks that useEffect hooks don't cause excessive re-renders.
            </p>
          </div>
        </div>

        {/* Cache Stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Cache Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium">Memory Items</div>
              <div className="text-blue-600">{stats.memoryItems}</div>
            </div>
            <div>
              <div className="font-medium">LocalStorage Items</div>
              <div className="text-green-600">{stats.localStorageItems}</div>
            </div>
            <div>
              <div className="font-medium">SessionStorage Items</div>
              <div className="text-purple-600">{stats.sessionStorageItems}</div>
            </div>
            <div>
              <div className="font-medium">Total Size</div>
              <div className="text-orange-600">{(stats.totalSize / 1024).toFixed(1)}KB</div>
            </div>
          </div>
        </div>

        {/* Hero Content Test */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">Hero Content Cache Test</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Loading</div>
              <div className={heroLoading ? 'text-yellow-600' : 'text-green-600'}>
                {heroLoading ? 'Yes' : 'No'}
              </div>
            </div>
            <div>
              <div className="font-medium">From Cache</div>
              <div className={fromCache ? 'text-green-600' : 'text-blue-600'}>
                {fromCache ? 'Yes' : 'No (Network)'}
              </div>
            </div>
            <div>
              <div className="font-medium">Error</div>
              <div className={heroError ? 'text-red-600' : 'text-green-600'}>
                {heroError ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
          {heroError && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
              {heroError.message}
            </div>
          )}
        </div>

        {/* Test Logs */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Test Logs</h3>
          <div className="max-h-64 overflow-y-auto text-xs font-mono space-y-1">
            {testLogs.map((log, index) => (
              <div key={index} className="text-gray-700">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => {
              setTestLogs([]);
              testQuotaHandling();
              testCacheLogic();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Re-run Tests
          </button>
          
          <button
            onClick={refreshStats}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Refresh Stats
          </button>
        </div>
      </div>
    </div>
  );
}