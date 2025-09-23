/**
 * Cache Test Page
 * Shows how the caching system works and provides debugging information
 */

'use client';

import CacheDebug from '@/components/debug/CacheDebug';
import SimpleCacheTest from '@/components/debug/SimpleCacheTest';
import WorkingCacheTest from '@/components/debug/WorkingCacheTest';
import CacheManager from '@/components/dev/CacheManager';
import { useCacheStats, useHeroContent, useServiceWorker } from '@/hooks/useCache';
import { useState } from 'react';

export default function CacheTestPage() {
  const [refreshCount, setRefreshCount] = useState(0);
  
  // Test the hero content caching
  const {
    data: heroContent,
    loading,
    error,
    fromCache,
    lastUpdated,
    refresh,
    clearCache
  } = useHeroContent();
  
  // Service worker status
  const { isSupported, isRegistered, clearCache: clearSWCache } = useServiceWorker();
  
  // Cache statistics
  const { stats } = useCacheStats();

  const handleRefresh = async () => {
    setRefreshCount(prev => prev + 1);
    await refresh();
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Cache System Test</h1>
      
      {/* Cache Statistics */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Cache Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Memory Cache</div>
            <div className="text-2xl font-mono">{stats.memoryItems}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Local Storage</div>
            <div className="text-2xl font-mono">{stats.localStorageItems}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Session Storage</div>
            <div className="text-2xl font-mono">{stats.sessionStorageItems}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Size</div>
            <div className="text-2xl font-mono">{Math.round(stats.totalSize / 1024)}KB</div>
          </div>
        </div>
      </div>

      {/* Service Worker Status */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Service Worker Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">Supported</div>
            <div className="text-lg">{isSupported ? '✅ Yes' : '❌ No'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Registered</div>
            <div className="text-lg">{isRegistered ? '✅ Active' : '❌ Not Active'}</div>
          </div>
        </div>
        
        {isRegistered && (
          <button
            onClick={() => clearSWCache()}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Clear Service Worker Cache
          </button>
        )}
      </div>

      {/* Content Caching Test */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Hero Content Cache Test</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-600">Loading Status</div>
            <div className="text-lg">{loading ? '⏳ Loading...' : '✅ Loaded'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Data Source</div>
            <div className="text-lg">{fromCache ? '📦 Cache' : '🌐 Network'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Last Updated</div>
            <div className="text-lg">{formatTime(lastUpdated)}</div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            Refresh Content (#{refreshCount})
          </button>
          
          <button
            onClick={clearCache}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
          >
            Clear Cache
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error.message}
          </div>
        )}

        {heroContent && (
          <div className="bg-gray-50 border border-gray-200 rounded p-4">
            <h3 className="font-semibold mb-2">Cached Content:</h3>
            <pre className="text-sm bg-white p-2 rounded border overflow-auto">
              {JSON.stringify(heroContent, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">How to Test Caching</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            <strong>First Load:</strong> Click "Refresh Content" and notice it shows "Network" as the data source.
          </li>
          <li>
            <strong>Cached Load:</strong> Click "Refresh Content" again quickly - it should show "Cache" as the data source and load instantly.
          </li>
          <li>
            <strong>Background Refresh:</strong> Wait a moment and the cache will be updated in the background automatically.
          </li>
          <li>
            <strong>Clear Cache:</strong> Click "Clear Cache" to remove cached data, then refresh to see network loading again.
          </li>
          <li>
            <strong>Service Worker:</strong> Assets like images and API responses are also cached by the service worker for offline access.
          </li>
          <li>
            <strong>Homepage Test:</strong> Go back to the homepage and reload - content should load instantly from cache.
          </li>
        </ol>
      </div>



      {/* Working Cache Test */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Working Cache Test</h2>
        <WorkingCacheTest />
      </div>

      {/* Simple Test */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Simple Cache Test</h2>
        <SimpleCacheTest />
      </div>

      {/* Debug Console */}
      <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Advanced Debug Console</h2>
        <CacheDebug />
      </div>

      {/* Fixed cache manager for easy access */}
      <CacheManager />
    </div>
  );
}