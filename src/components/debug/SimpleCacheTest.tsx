/**
 * Simple Cache Test - Direct API test without hooks
 */

'use client';

import { CACHE_CONFIGS, cacheManager } from '@/lib/browser-cache';
import { useState } from 'react';

export default function SimpleCacheTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev]);
  };

  const runSimpleTest = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);

    try {
      addLog('🧪 Starting simple cache test...');

      // Test 1: Basic environment check
      addLog(`Environment: ${typeof window !== 'undefined' ? 'Browser' : 'Server'}`);
      addLog(`LocalStorage available: ${typeof window !== 'undefined' && window.localStorage ? 'Yes' : 'No'}`);
      
      // Test 2: Simple data test
      const testKey = 'simple_test';
      const testData = { test: true, timestamp: Date.now() };
      
      addLog('📦 Setting cache...');
      await cacheManager.set(testKey, testData, CACHE_CONFIGS.CONTENT);
      
      addLog('📋 Getting cache...');
      const retrieved = await cacheManager.get(testKey, CACHE_CONFIGS.CONTENT);
      
      if (retrieved) {
        addLog(`✅ Success! Retrieved: ${JSON.stringify(retrieved)}`);
      } else {
        addLog('❌ Failed to retrieve from cache');
      }
      
      // Test 3: Check statistics
      const stats = await cacheManager.getStats();
      addLog(`📊 Cache stats: Memory=${stats.memoryItems}, Local=${stats.localStorageItems}, Session=${stats.sessionStorageItems}, Size=${stats.totalSize}`);
      
      // Test 4: Manual localStorage check
      if (typeof window !== 'undefined') {
        const cacheKey = `onsi_cache_${testKey}`;
        const manualCheck = window.localStorage.getItem(cacheKey);
        addLog(`🔍 Manual localStorage check: ${manualCheck ? 'Found' : 'Not found'}`);
        
        // List all onsi cache items
        const allKeys = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith('onsi_cache_')) {
            allKeys.push(key);
          }
        }
        addLog(`🗂️ All cache keys: ${allKeys.length > 0 ? allKeys.join(', ') : 'None'}`);
      }

    } catch (error) {
      addLog(`💥 Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="flex gap-2 mb-4">
        <button
          onClick={runSimpleTest}
          disabled={isRunning}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Simple Test'}
        </button>
        <button
          onClick={clearLogs}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Clear Logs
        </button>
      </div>
      
      <div className="bg-black text-green-400 font-mono text-sm p-4 rounded max-h-64 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500">Click "Run Simple Test" to start</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))
        )}
      </div>
    </div>
  );
}