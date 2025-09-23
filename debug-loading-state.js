/**
 * Debug script to test loading states in the browser console
 * Copy and paste this into the browser console to monitor loading tasks
 */

// Monitor loading context state
function monitorLoadingState() {
  const interval = setInterval(() => {
    // Try to access React context through the DOM
    const loadingElement = document.querySelector('[data-loading-debug]');
    if (loadingElement) {
      console.log('📊 Current loading state:', {
        timestamp: new Date().toISOString(),
        visible: !document.querySelector('.global-loading-overlay')?.classList.contains('opacity-0'),
        spinner: document.querySelector('.global-loading-overlay') ? 'present' : 'missing'
      });
    }
  }, 1000);
  
  // Stop after 30 seconds
  setTimeout(() => {
    clearInterval(interval);
    console.log('🔚 Monitoring stopped');
  }, 30000);
  
  console.log('🔍 Starting loading state monitor for 30 seconds...');
}

// Check video loading state
function checkVideoState() {
  const video = document.querySelector('video');
  if (video) {
    console.log('🎬 Video state:', {
      src: video.src,
      readyState: video.readyState,
      duration: video.duration,
      buffered: video.buffered.length > 0 ? video.buffered.end(0) : 0,
      networkState: video.networkState,
      paused: video.paused,
      ended: video.ended,
      error: video.error
    });
  } else {
    console.log('❌ No video element found');
  }
}

// Export functions to window for easy access
window.monitorLoadingState = monitorLoadingState;
window.checkVideoState = checkVideoState;

console.log('🔧 Debug functions available: monitorLoadingState(), checkVideoState()');
console.log('📝 Usage: Open browser console and run monitorLoadingState()');