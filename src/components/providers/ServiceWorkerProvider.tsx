/**
 * Service Worker Registration Component
 * Handles automatic registration of the service worker for caching
 */

'use client';

import { useEffect } from 'react';

export default function ServiceWorkerProvider() {
  useEffect(() => {
    // Only register service worker in production or when explicitly enabled
    const shouldRegister = 
      process.env.NODE_ENV === 'production' ||
      process.env.NEXT_PUBLIC_ENABLE_SW === 'true' ||
      typeof window !== 'undefined' && window.location.search.includes('enable_sw=true');

    if (shouldRegister && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })
      .then((registration) => {
        console.log('✅ Service Worker registered successfully:', registration.scope);
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available, could show notification
                console.log('🔄 New Service Worker content available');
                
                // Auto-update in development, notify in production
                if (process.env.NODE_ENV === 'development') {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                } else {
                  // Could trigger a user notification here
                  console.log('🔄 New version available. Refresh to update.');
                }
              }
            });
          }
        });
        
        // Listen for controlling service worker changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // Service worker updated, could refresh the page
          console.log('🔄 Service Worker updated');
        });
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
      
      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('📦 Cache updated:', event.data.cache);
        }
      });
    } else {
      console.log('🔧 Service Worker disabled or not supported');
    }
  }, []);

  return null; // This component doesn't render anything
}