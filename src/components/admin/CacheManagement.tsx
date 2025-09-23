'use client';

import { assetCache } from '@/lib/asset-cache';
import { useEffect, useState } from 'react';

interface CacheStats {
  totalSize: number;
  videoCount: number;
  imageCount: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

interface CacheEntry {
  key: string;
  url: string;
  type: 'video' | 'image';
  size: number;
  timestamp: Date;
  version?: string;
}

export default function CacheManagement() {
  const [stats, setStats] = useState<CacheStats>({
    totalSize: 0,
    videoCount: 0,
    imageCount: 0,
    oldestEntry: null,
    newestEntry: null,
  });
  
  const [entries, setEntries] = useState<CacheEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Load cache statistics
  const loadStats = async () => {
    setLoading(true);
    try {
      const allEntries = await assetCache.getAllEntries();
      let totalSize = 0;
      let videoCount = 0;
      let imageCount = 0;
      let oldestEntry: Date | null = null;
      let newestEntry: Date | null = null;
      
      const entryList: CacheEntry[] = [];
      
      for (const entry of allEntries) {
        const size = entry.data?.byteLength || 0;
        totalSize += size;
        
        if (entry.url.includes('video') || entry.url.includes('.mp4')) {
          videoCount++;
        } else {
          imageCount++;
        }
        
        const timestamp = new Date(entry.timestamp);
        if (!oldestEntry || timestamp < oldestEntry) {
          oldestEntry = timestamp;
        }
        if (!newestEntry || timestamp > newestEntry) {
          newestEntry = timestamp;
        }
        
        entryList.push({
          key: entry.key,
          url: entry.url,
          type: entry.url.includes('video') || entry.url.includes('.mp4') ? 'video' : 'image',
          size,
          timestamp,
          version: entry.version,
        });
      }
      
      setStats({
        totalSize,
        videoCount,
        imageCount,
        oldestEntry,
        newestEntry,
      });
      
      setEntries(entryList.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    } catch (error) {
      console.error('Failed to load cache stats:', error);
      setMessage('Failed to load cache statistics');
    }
    setLoading(false);
  };
  
  // Clear all cache
  const clearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached assets?')) return;
    
    setLoading(true);
    try {
      await assetCache.clearCache();
      
      // Also clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      setMessage('Cache cleared successfully');
      await loadStats();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      setMessage('Failed to clear cache');
    }
    setLoading(false);
  };
  
  // Clear old entries (older than 7 days)
  const clearOldEntries = async () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    setLoading(true);
    try {
      await assetCache.cleanupOldEntries(weekAgo);
      setMessage('Old entries cleared successfully');
      await loadStats();
    } catch (error) {
      console.error('Failed to clear old entries:', error);
      setMessage('Failed to clear old entries');
    }
    setLoading(false);
  };
  
  // Test caching with a sample video/image
  const testCaching = async () => {
    setLoading(true);
    try {
      const testUrl = '/api/media/test-video';
      
      // First load (should fetch from network)
      const start1 = Date.now();
      await assetCache.getAsset(testUrl, 'video/mp4');
      const time1 = Date.now() - start1;
      
      // Second load (should load from cache)
      const start2 = Date.now();
      await assetCache.getAsset(testUrl, 'video/mp4');
      const time2 = Date.now() - start2;
      
      setMessage(`Cache test: Network: ${time1}ms, Cache: ${time2}ms (${Math.round((time1 - time2) / time1 * 100)}% faster)`);
      await loadStats();
    } catch (error) {
      console.error('Cache test failed:', error);
      setMessage('Cache test failed');
    }
    setLoading(false);
  };
  
  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  useEffect(() => {
    loadStats();
  }, []);
  
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cache Management</h1>
        <button
          onClick={loadStats}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
          {message}
        </div>
      )}
      
      {/* Cache Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Size</h3>
          <p className="text-2xl font-bold text-gray-900">{formatBytes(stats.totalSize)}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Videos Cached</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.videoCount}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Images Cached</h3>
          <p className="text-2xl font-bold text-green-600">{stats.imageCount}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Entries</h3>
          <p className="text-2xl font-bold text-purple-600">{entries.length}</p>
        </div>
      </div>
      
      {/* Cache Actions */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <h3 className="text-lg font-semibold mb-4">Cache Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={testCaching}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test Caching Performance
          </button>
          
          <button
            onClick={clearOldEntries}
            disabled={loading}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
          >
            Clear Old Entries (7+ days)
          </button>
          
          <button
            onClick={clearCache}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Clear All Cache
          </button>
        </div>
      </div>
      
      {/* Service Worker Status */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <h3 className="text-lg font-semibold mb-4">Service Worker Status</h3>
        <div className="space-y-2">
          <p className="flex justify-between">
            <span>Service Worker:</span>
            <span className={`font-medium ${
              'serviceWorker' in navigator ? 'text-green-600' : 'text-red-600'
            }`}>
              {'serviceWorker' in navigator ? 'Supported' : 'Not Supported'}
            </span>
          </p>
          
          <p className="flex justify-between">
            <span>Cache API:</span>
            <span className={`font-medium ${
              'caches' in window ? 'text-green-600' : 'text-red-600'
            }`}>
              {'caches' in window ? 'Available' : 'Not Available'}
            </span>
          </p>
          
          <p className="flex justify-between">
            <span>IndexedDB:</span>
            <span className={`font-medium ${
              'indexedDB' in window ? 'text-green-600' : 'text-red-600'
            }`}>
              {'indexedDB' in window ? 'Available' : 'Not Available'}
            </span>
          </p>
        </div>
      </div>
      
      {/* Cache Entries List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Cached Assets ({entries.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cached
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((entry, index) => (
                <tr key={entry.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">
                    <span title={entry.url}>{entry.url}</span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      entry.type === 'video' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {formatBytes(entry.size)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {entry.timestamp.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {entry.version || 'N/A'}
                  </td>
                </tr>
              ))}
              
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No cached assets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}