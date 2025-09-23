'use client';

import { cacheManager } from '@/lib/browser-cache';
import { useCallback, useEffect, useState } from 'react';

export default function CacheTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoTestRun, setAutoTestRun] = useState(false);

  const addResult = (message: string) => {
    console.log(message);
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTest = useCallback(async () => {
    setLoading(true);
    setTestResults([]);

    try {
      addResult('🚀 Starting cache test...');

      // Test 1: Set a simple value
      const testKey = 'test_item_' + Date.now();
      const testData = { message: 'Hello Cache!', timestamp: Date.now() };
      
      addResult(`📝 Setting cache: ${testKey}`);
      await cacheManager.set(testKey, testData);
      addResult('✅ Cache set completed');

      // Test 2: Get the value immediately
      addResult(`🔍 Getting cache: ${testKey}`);
      const retrieved = await cacheManager.get(testKey);
      
      if (retrieved) {
        addResult(`✅ Cache hit! Data: ${JSON.stringify(retrieved)}`);
      } else {
        addResult('❌ Cache miss - no data retrieved');
      }

      // Test 3: Check stats
      const stats = cacheManager.getStats();
      addResult(`📊 Cache stats: ${JSON.stringify(stats)}`);

      // Test 4: Clear cache
      addResult(`🗑️ Removing cache: ${testKey}`);
      await cacheManager.remove(testKey);
      addResult('✅ Cache removed');

      // Test 5: Try to get after removal
      const afterRemoval = await cacheManager.get(testKey);
      if (afterRemoval) {
        addResult('❌ Cache item still exists after removal');
      } else {
        addResult('✅ Cache item properly removed');
      }

      addResult('🎉 Cache test completed!');
    } catch (error) {
      addResult(`❌ Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-run test on component mount
  useEffect(() => {
    if (!autoTestRun) {
      setAutoTestRun(true);
      setTimeout(() => runTest(), 100);
    }
  }, [autoTestRun, runTest]);

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">Direct Cache Test</h3>
      
      <button
        onClick={runTest}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 mb-4"
      >
        {loading ? 'Running Test...' : 'Run Cache Test'}
      </button>

      {testResults.length > 0 && (
        <div className="bg-gray-100 p-3 rounded">
          <h4 className="font-medium mb-2">Test Results:</h4>
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono text-gray-700">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}