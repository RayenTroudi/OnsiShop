/**
 * Cache Debug Component
 * Provides detailed logging and debugging for cache operations
 */

'use client';

import { CACHE_CONFIGS, CACHE_KEYS, cacheManager } from '@/lib/browser-cache';
import { useEffect, useState } from 'react';

export default function CacheDebug() {
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const runCacheTest = async () => {
    addLog('🧪 Starting cache test...');
    
    try {
      // Test 1: Check if we're in browser environment
      addLog(`Browser check: ${typeof window !== 'undefined' ? '✅ Client-side' : '❌ Server-side'}`);
      
      // Test 2: Check localStorage availability
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('test', 'test');
          window.localStorage.removeItem('test');
          addLog('✅ localStorage available');
        }
      } catch (e) {
        addLog('❌ localStorage not available: ' + e);
      }
      
      // Test 3: Simple cache set/get test
      const testKey = 'debug_test';
      const testData = { message: 'Hello Cache!', timestamp: Date.now() };
      
      addLog(`📦 Setting cache: ${testKey}`);
      await cacheManager.set(testKey, testData, CACHE_CONFIGS.TEMPORARY);
      
      addLog(`📋 Getting cache: ${testKey}`);
      const retrieved = await cacheManager.get(testKey, CACHE_CONFIGS.TEMPORARY);
      
      if (retrieved) {
        addLog(`✅ Cache test successful: ${JSON.stringify(retrieved)}`);
        setTestResults(prev => ({ ...prev, basicTest: true }));
      } else {
        addLog(`❌ Cache test failed: got null`);
        setTestResults(prev => ({ ...prev, basicTest: false }));
      }
      
      // Test 4: Check cache stats
      const stats = await cacheManager.getStats();
      addLog(`📊 Cache stats: ${JSON.stringify(stats)}`);
      setTestResults(prev => ({ ...prev, stats }));
      
      // Test 5: Try content fetch simulation
      addLog('🌐 Simulating content fetch...');
      try {
        const contentResponse = await fetch('/api/content');
        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          addLog(`✅ Content API working: ${contentData.success ? 'success' : 'failed'}`);
          
          if (contentData.success && contentData.data) {
            addLog(`📦 Caching content data...`);
            await cacheManager.set(CACHE_KEYS.CONTENT, contentData.data, CACHE_CONFIGS.CONTENT);
            
            const cachedContent = await cacheManager.get(CACHE_KEYS.CONTENT, CACHE_CONFIGS.CONTENT);
            if (cachedContent) {
              addLog(`✅ Content cached successfully`);
              setTestResults(prev => ({ ...prev, contentCache: true }));
            } else {
              addLog(`❌ Content cache failed`);
              setTestResults(prev => ({ ...prev, contentCache: false }));
            }
          }
        } else {
          addLog(`❌ Content API failed: ${contentResponse.status}`);
        }
      } catch (e) {
        addLog(`❌ Content fetch error: ${e}`);
      }
      
      // Final stats check
      const finalStats = await cacheManager.getStats();
      addLog(`🏁 Final cache stats: ${JSON.stringify(finalStats)}`);
      
    } catch (error) {
      addLog(`💥 Cache test error: ${error}`);
    }
  };

  const clearDebug = () => {
    setDebugLogs([]);
    setTestResults({});
  };

  useEffect(() => {
    // Run test automatically on mount
    runCacheTest();
  }, []);

  return (
    <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-lg max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold">Cache Debug Console</h3>
        <div className="space-x-2">
          <button
            onClick={runCacheTest}
            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
          >
            Run Test
          </button>
          <button
            onClick={clearDebug}
            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
          >
            Clear
          </button>
        </div>
      </div>
      
      {Object.keys(testResults).length > 0 && (
        <div className="mb-4 p-2 bg-gray-800 rounded">
          <div className="text-yellow-400 mb-2">Test Results:</div>
          <pre className="text-xs">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="space-y-1">
        {debugLogs.length === 0 ? (
          <div className="text-gray-500">No logs yet...</div>
        ) : (
          debugLogs.map((log, index) => (
            <div key={index} className="border-l-2 border-gray-600 pl-2">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}