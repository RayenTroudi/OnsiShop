// Enhanced Service Worker for OnsiShop
// Advanced caching with stale-while-revalidate, cache versioning, and progressive asset loading

const CACHE_VERSION = '1.1.0';
const CACHE_NAME = `onsi-shop-v${CACHE_VERSION}`;
const STATIC_CACHE = `onsi-static-v${CACHE_VERSION}`;
const API_CACHE = `onsi-api-v${CACHE_VERSION}`;
const MEDIA_CACHE = `onsi-media-v${CACHE_VERSION}`;
const VIDEO_CACHE = `onsi-video-v${CACHE_VERSION}`;
const IMAGE_CACHE = `onsi-image-v${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/favicon.png',
  '/images/logo.png',
  '/_next/static/css/',
  '/_next/static/js/',
];

// API endpoints to cache with different strategies
const API_ENDPOINTS = {
  CACHE_FIRST: ['/api/content', '/api/categories', '/api/products'],
  STALE_WHILE_REVALIDATE: ['/api/content', '/api/translations'],
  NETWORK_FIRST: ['/api/auth', '/api/admin']
};

// Media file categorization for optimized caching
const MEDIA_TYPES = {
  IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'],
  VIDEOS: ['.mp4', '.webm', '.mov', '.avi', '.mkv'],
  AUDIO: ['.mp3', '.wav', '.ogg', '.flac']
};

// Cache duration settings (in milliseconds)
const CACHE_DURATIONS = {
  STATIC: 24 * 60 * 60 * 1000, // 24 hours
  API: 60 * 60 * 1000, // 1 hour
  IMAGES: 7 * 24 * 60 * 60 * 1000, // 7 days
  VIDEOS: 30 * 24 * 60 * 60 * 1000, // 30 days
  AUDIO: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Cache size limits (in bytes)
const CACHE_LIMITS = {
  STATIC: 50 * 1024 * 1024, // 50MB
  API: 10 * 1024 * 1024, // 10MB
  IMAGES: 100 * 1024 * 1024, // 100MB
  VIDEOS: 500 * 1024 * 1024, // 500MB
  AUDIO: 50 * 1024 * 1024, // 50MB
};

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('📦 Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        const currentCaches = [
          CACHE_NAME,
          STATIC_CACHE,
          API_CACHE,
          MEDIA_CACHE,
          VIDEO_CACHE,
          IMAGE_CACHE
        ];
        
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages immediately
      self.clients.claim(),
      // Initialize cache cleanup schedule
      schedulePeriodicCacheCleanup(),
    ])
  );
});

// Schedule periodic cache cleanup to manage storage usage
async function schedulePeriodicCacheCleanup() {
  // Clean up expired entries every 24 hours
  setInterval(async () => {
    console.log('🧹 SW: Running periodic cache cleanup');
    
    const cacheNames = [STATIC_CACHE, API_CACHE, MEDIA_CACHE, VIDEO_CACHE, IMAGE_CACHE];
    
    for (const cacheName of cacheNames) {
      try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const key of keys) {
          const response = await cache.match(key);
          if (response) {
            const maxAge = getCacheMaxAge(cacheName);
            if (isResponseExpired(response, maxAge)) {
              console.log(`🗑️ SW: Removing expired cache entry: ${key.url}`);
              await cache.delete(key);
            }
          }
        }
      } catch (error) {
        console.warn(`Cache cleanup error for ${cacheName}:`, error);
      }
    }
  }, 24 * 60 * 60 * 1000); // 24 hours
}

function getCacheMaxAge(cacheName) {
  switch (cacheName) {
    case VIDEO_CACHE: return CACHE_DURATIONS.VIDEOS;
    case IMAGE_CACHE: return CACHE_DURATIONS.IMAGES;
    case API_CACHE: return CACHE_DURATIONS.API;
    case STATIC_CACHE: return CACHE_DURATIONS.STATIC;
    default: return CACHE_DURATIONS.IMAGES;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (isMediaFile(url.pathname)) {
    event.respondWith(handleMediaRequest(request));
  } else if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticRequest(request));
  } else {
    // For navigation requests, use network first with fallback
    event.respondWith(handleNavigationRequest(request));
  }
});

// Handle API requests with intelligent caching strategies
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Determine caching strategy based on endpoint
  let strategy = 'none';
  if (API_ENDPOINTS.CACHE_FIRST.some(endpoint => pathname.startsWith(endpoint))) {
    strategy = 'cache-first';
  } else if (API_ENDPOINTS.STALE_WHILE_REVALIDATE.some(endpoint => pathname.startsWith(endpoint))) {
    strategy = 'stale-while-revalidate';
  } else if (API_ENDPOINTS.NETWORK_FIRST.some(endpoint => pathname.startsWith(endpoint))) {
    strategy = 'network-first';
  }
  
  if (strategy === 'none') {
    return fetch(request);
  }
  
  try {
    const cache = await caches.open(API_CACHE);
    
    if (strategy === 'cache-first') {
      return handleCacheFirst(request, cache);
    } else if (strategy === 'stale-while-revalidate') {
      return handleStaleWhileRevalidate(request, cache);
    } else if (strategy === 'network-first') {
      return handleNetworkFirst(request, cache);
    }
    
  } catch (error) {
    console.error('API request handling error:', error);
    return handleOfflineFallback(request);
  }
}

// Cache-first strategy: Check cache first, fallback to network
async function handleCacheFirst(request, cache) {
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse && !isResponseExpired(cachedResponse, CACHE_DURATIONS.API)) {
    console.log('📋 SW: Cache-first hit:', request.url);
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      console.log('🌐 SW: Cache-first network update:', request.url);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Serve stale cache if network fails
    if (cachedResponse) {
      console.log('📋 SW: Serving stale cache (network failed):', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// Stale-while-revalidate: Return cache immediately, update in background
async function handleStaleWhileRevalidate(request, cache) {
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    console.log('📋 SW: Stale-while-revalidate cache hit:', request.url);
    
    // Update in background (don't await)
    fetch(request)
      .then(response => {
        if (response.ok) {
          console.log('🔄 SW: Background revalidation:', request.url);
          return cache.put(request, response.clone());
        }
      })
      .catch(error => {
        console.warn('Background revalidation failed:', error);
      });
    
    return cachedResponse;
  }
  
  // No cache, fetch from network
  const response = await fetch(request);
  if (response.ok) {
    console.log('🌐 SW: First-time cache:', request.url);
    await cache.put(request, response.clone());
  }
  return response;
}

// Network-first strategy: Try network first, fallback to cache
async function handleNetworkFirst(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      console.log('🌐 SW: Network-first success:', request.url);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📋 SW: Network-first fallback to cache:', request.url);
      return cachedResponse;
    }
    throw error;
  }
}

// Handle media files with optimized caching strategies
async function handleMediaRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();
  
  // Determine media type and appropriate cache
  let cacheName = MEDIA_CACHE;
  let maxAge = CACHE_DURATIONS.IMAGES;
  
  if (MEDIA_TYPES.VIDEOS.some(ext => pathname.includes(ext))) {
    cacheName = VIDEO_CACHE;
    maxAge = CACHE_DURATIONS.VIDEOS;
  } else if (MEDIA_TYPES.IMAGES.some(ext => pathname.includes(ext))) {
    cacheName = IMAGE_CACHE;
    maxAge = CACHE_DURATIONS.IMAGES;
  } else if (MEDIA_TYPES.AUDIO.some(ext => pathname.includes(ext))) {
    cacheName = MEDIA_CACHE;
    maxAge = CACHE_DURATIONS.AUDIO;
  }
  
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Check if cached response is still valid
    if (cachedResponse && !isResponseExpired(cachedResponse, maxAge)) {
      console.log(`� SW: Serving ${getMediaType(pathname)} from cache:`, pathname);
      
      // For videos, add proper headers for range requests
      if (cacheName === VIDEO_CACHE && request.headers.get('range')) {
        return handleRangeRequest(request, cachedResponse);
      }
      
      return cachedResponse;
    }
    
    // Fetch from network with progress tracking for large files
    const response = await fetch(request);
    
    if (response.ok) {
      const contentLength = response.headers.get('content-length');
      const fileSize = contentLength ? parseInt(contentLength, 10) : 0;
      
      console.log(`🌐 SW: Caching ${getMediaType(pathname)} (${formatBytes(fileSize)}):`, pathname);
      
      // Check cache size limits before storing
      if (await shouldCacheFile(cacheName, fileSize)) {
        await cache.put(request, response.clone());
      } else {
        console.warn(`⚠️ SW: File too large to cache (${formatBytes(fileSize)}):`, pathname);
      }
    }
    
    return response;
  } catch (error) {
    console.error(`❌ SW: Media file error (${getMediaType(pathname)}):`, error);
    return handleMediaFallback(request, pathname);
  }
}

// Handle HTTP range requests for video streaming
async function handleRangeRequest(request, cachedResponse) {
  const rangeHeader = request.headers.get('range');
  if (!rangeHeader) {
    return cachedResponse;
  }
  
  try {
    const blob = await cachedResponse.blob();
    const totalSize = blob.size;
    
    // Parse range header (e.g., "bytes=0-1023")
    const ranges = rangeHeader.replace(/bytes=/, '').split('-');
    const start = parseInt(ranges[0], 10);
    const end = ranges[1] ? parseInt(ranges[1], 10) : totalSize - 1;
    
    const slicedBlob = blob.slice(start, end + 1);
    
    return new Response(slicedBlob, {
      status: 206, // Partial Content
      statusText: 'Partial Content',
      headers: {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': slicedBlob.size.toString(),
        'Content-Type': cachedResponse.headers.get('content-type') || 'video/mp4',
      },
    });
  } catch (error) {
    console.error('Range request handling error:', error);
    return cachedResponse;
  }
}

// Check if file should be cached based on size limits
async function shouldCacheFile(cacheName, fileSize) {
  const limit = getCacheLimit(cacheName);
  
  if (fileSize > limit) {
    return false;
  }
  
  // Check current cache usage
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    let currentSize = 0;
    
    for (const key of keys) {
      const response = await cache.match(key);
      if (response) {
        const blob = await response.blob();
        currentSize += blob.size;
      }
    }
    
    return (currentSize + fileSize) <= limit;
  } catch (error) {
    console.warn('Cache size check failed:', error);
    return fileSize <= 50 * 1024 * 1024; // Default 50MB limit
  }
}

// Get appropriate cache size limit
function getCacheLimit(cacheName) {
  if (cacheName === VIDEO_CACHE) return CACHE_LIMITS.VIDEOS;
  if (cacheName === IMAGE_CACHE) return CACHE_LIMITS.IMAGES;
  if (cacheName === STATIC_CACHE) return CACHE_LIMITS.STATIC;
  if (cacheName === API_CACHE) return CACHE_LIMITS.API;
  return CACHE_LIMITS.IMAGES; // Default
}

// Handle media fallbacks
async function handleMediaFallback(request, pathname) {
  const mediaType = getMediaType(pathname);
  
  if (mediaType === 'video') {
    return new Response('Video unavailable', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  } else if (mediaType === 'image') {
    // Return a minimal SVG placeholder
    const placeholder = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable</text>
    </svg>`;
    
    return new Response(placeholder, {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
  
  return new Response('Media not available', { status: 404 });
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // For critical static assets, return a minimal fallback
    if (request.url.includes('/_next/static/')) {
      return new Response('/* Cached resource unavailable */', {
        headers: { 'Content-Type': 'text/css' },
      });
    }
    
    return new Response('Resource not available', { status: 404 });
  }
}

// Handle navigation requests (HTML pages)
async function handleNavigationRequest(request) {
  try {
    // Always try network first for navigation
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page or minimal HTML
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>OnsiShop - Offline</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline { color: #666; }
          </style>
        </head>
        <body>
          <div class="offline">
            <h1>You're offline</h1>
            <p>Please check your internet connection and try again.</p>
          </div>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}

// Helper functions
function isMediaFile(pathname) {
  const allMediaExtensions = [...MEDIA_TYPES.IMAGES, ...MEDIA_TYPES.VIDEOS, ...MEDIA_TYPES.AUDIO];
  return allMediaExtensions.some(ext => pathname.toLowerCase().includes(ext)) ||
         pathname.startsWith('/api/media/') ||
         pathname.includes('/videos/') ||
         pathname.includes('/images/') ||
         pathname.includes('/uploads/');
}

function isStaticAsset(pathname) {
  return pathname.startsWith('/_next/static/') ||
         pathname.startsWith('/static/') ||
         pathname.includes('.css') ||
         pathname.includes('.js') ||
         pathname.includes('.ico') ||
         (pathname.includes('.png') && !pathname.startsWith('/api/'));
}

function getMediaType(pathname) {
  const lower = pathname.toLowerCase();
  if (MEDIA_TYPES.VIDEOS.some(ext => lower.includes(ext))) return 'video';
  if (MEDIA_TYPES.IMAGES.some(ext => lower.includes(ext))) return 'image';
  if (MEDIA_TYPES.AUDIO.some(ext => lower.includes(ext))) return 'audio';
  return 'unknown';
}

function isResponseExpired(response, maxAge) {
  const cacheDate = new Date(response.headers.get('date') || 0);
  const now = new Date();
  const age = now.getTime() - cacheDate.getTime();
  return age > maxAge;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Enhanced offline fallback for API requests
async function handleOfflineFallback(request) {
  const url = new URL(request.url);
  
  return new Response(
    JSON.stringify({ 
      error: 'Network unavailable',
      offline: true,
      timestamp: Date.now(),
      requestedUrl: url.pathname
    }),
    {
      status: 503,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
    }
  );
}

// Listen for messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    const cacheName = event.data.cache || 'all';
    clearCache(cacheName);
  }
});

// Clear specific cache or all caches
async function clearCache(cacheName) {
  try {
    if (cacheName === 'all') {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('🧹 Service Worker: All caches cleared');
    } else {
      await caches.delete(cacheName);
      console.log(`🧹 Service Worker: Cache cleared: ${cacheName}`);
    }
  } catch (error) {
    console.error('❌ Service Worker: Error clearing cache:', error);
  }
}