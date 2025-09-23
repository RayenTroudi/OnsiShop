/**
 * Cache Management Component
 * Provides UI for clearing cache and viewing cache statistics (for development)
 */

'use client';

import { useCacheStats } from '@/hooks/useCache';
import { useState } from 'react';

export default function CacheManager() {
  const { stats, refreshStats, clearAllCache, clearCacheByPrefix } = useCacheStats();
  const [showDetails, setShowDetails] = useState(false);

  // Only show in development or with debug flag
  const isDevelopment = process.env.NODE_ENV === 'development';
  const showDebug = typeof window !== 'undefined' && window.location.search.includes('debug_cache=true');
  
  if (!isDevelopment && !showDebug) {
    return null;
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm shadow-lg hover:bg-blue-700 transition-colors"
      >
        📦 Cache {showDetails ? '▼' : '▶'}
      </button>
      
      {showDetails && (
        <div className="absolute bottom-10 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 min-w-64">
          <h3 className="font-bold text-lg mb-3 text-gray-800">Cache Statistics</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Memory Items:</span>
              <span className="font-mono">{stats.memoryItems}</span>
            </div>
            <div className="flex justify-between">
              <span>LocalStorage:</span>
              <span className="font-mono">{stats.localStorageItems}</span>
            </div>
            <div className="flex justify-between">
              <span>SessionStorage:</span>
              <span className="font-mono">{stats.sessionStorageItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Size:</span>
              <span className="font-mono">{formatBytes(stats.totalSize)}</span>
            </div>
          </div>
          
          <hr className="my-3" />
          
          <div className="space-y-2">
            <button
              onClick={refreshStats}
              className="w-full bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              🔄 Refresh Stats
            </button>
            
            <button
              onClick={() => clearCacheByPrefix('content_')}
              className="w-full bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors"
            >
              🗑️ Clear Content Cache
            </button>
            
            <button
              onClick={() => clearCacheByPrefix('hero_')}
              className="w-full bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
            >
              🗑️ Clear Hero Cache
            </button>
            
            <button
              onClick={clearAllCache}
              className="w-full bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
            >
              🧹 Clear All Cache
            </button>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            <p>Use ?debug_cache=true to show in production</p>
            <p>Service worker caches managed separately</p>
          </div>
        </div>
      )}
    </div>
  );
}