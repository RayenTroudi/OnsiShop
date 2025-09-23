/**
 * Working Cache Test Component
 */

'use client';

import { contentCache, simpleCache } from '@/lib/simple-cache';
import { useEffect, useState } from 'react';

export default function WorkingCacheTest() {
  const [status, setStatus] = useState('Ready');
  const [content, setContent] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const testBasicCache = async () => {
    setStatus('Testing basic cache...');
    addLog('🧪 Testing basic cache');
    
    // Test basic set/get
    simpleCache.set('test_key', { message: 'Hello Cache!', time: Date.now() });
    const retrieved = simpleCache.get('test_key');
    
    if (retrieved) {
      addLog(`✅ Basic cache works: ${JSON.stringify(retrieved)}`);
    } else {
      addLog('❌ Basic cache failed');
    }
    
    updateStats();
    setStatus('Ready');
  };

  const testContentCache = async () => {
    setStatus('Testing content cache...');
    addLog('🌐 Testing content cache');
    
    try {
      const startTime = Date.now();
      const result = await contentCache.getContent();
      const endTime = Date.now();
      
      setContent(result);
      addLog(`✅ Content loaded in ${endTime - startTime}ms`);
      addLog(`📦 Content keys: ${Object.keys(result || {}).join(', ')}`);
      
      // Test cache hit on second call
      const startTime2 = Date.now();
      await contentCache.getContent();
      const endTime2 = Date.now();
      
      addLog(`⚡ Second call took ${endTime2 - startTime2}ms (should be instant)`);
      
    } catch (error) {
      addLog(`❌ Content cache error: ${error}`);
    }
    
    updateStats();
    setStatus('Ready');
  };

  const clearCache = () => {
    simpleCache.clear();
    contentCache.clearCache();
    addLog('🧹 All cache cleared');
    setContent(null);
    updateStats();
  };

  const updateStats = () => {
    const newStats = contentCache.getStats();
    setStats(newStats);
  };

  useEffect(() => {
    updateStats();
  }, []);

  return (
    <div className="p-6 bg-white border rounded-lg">
      <h3 className="text-xl font-bold mb-4">Working Cache Test</h3>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded">
        <div>
          <div className="text-sm text-gray-600">Memory Items</div>
          <div className="text-2xl font-bold">{stats.memoryItems || 0}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">LocalStorage Items</div>
          <div className="text-2xl font-bold">{stats.localStorageItems || 0}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">Total Items</div>
          <div className="text-2xl font-bold">{stats.totalItems || 0}</div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <span className="font-semibold">Status:</span> {status}
      </div>

      {/* Controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={testBasicCache}
          disabled={status !== 'Ready'}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Basic Cache
        </button>
        
        <button
          onClick={testContentCache}
          disabled={status !== 'Ready'}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Test Content Cache
        </button>
        
        <button
          onClick={clearCache}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Clear Cache
        </button>
      </div>

      {/* Content Display */}
      {content && (
        <div className="mb-4 p-4 bg-green-50 rounded">
          <h4 className="font-semibold mb-2">Cached Content:</h4>
          <div className="text-sm">
            Found {Object.keys(content).length} content items:
            <ul className="ml-4 mt-1">
              {Object.keys(content).slice(0, 5).map(key => (
                <li key={key}>• {key}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Logs */}
      <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded max-h-48 overflow-y-auto">
        <div className="font-bold text-white mb-2">Logs:</div>
        {logs.length === 0 ? (
          <div className="text-gray-500">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))
        )}
      </div>
    </div>
  );
}