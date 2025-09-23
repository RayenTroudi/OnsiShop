// Simple fix for hero video loading completion
const fixHeroVideoLoading = () => {
  console.log('🔧 Fixing hero video loading...');
  
  // Wait a moment for the page to initialize
  setTimeout(() => {
    // Look for any remaining hero-video loading tasks in the DOM
    const allElements = document.querySelectorAll('*');
    let foundLoadingTask = false;
    
    allElements.forEach(el => {
      if (el.textContent && el.textContent.includes('hero-video')) {
        console.log('🔍 Found hero-video loading task text:', el.textContent);
        foundLoadingTask = true;
      }
    });
    
    // Check for video elements
    const videoElements = document.querySelectorAll('video');
    console.log(`🎬 Found ${videoElements.length} video elements`);
    
    videoElements.forEach((video, index) => {
      console.log(`Video ${index + 1}:`, {
        src: video.src ? (video.src.startsWith('data:') ? 'data URL (cached)' : video.src) : 'No src',
        readyState: video.readyState,
        paused: video.paused,
        currentTime: video.currentTime,
        duration: video.duration || 'unknown'
      });
      
      // If we have a cached video that's ready but loading is still showing
      if (video.src && video.src.startsWith('data:') && foundLoadingTask) {
        console.log('🚀 Cached video detected with active loading task - forcing completion');
        
        // Try to trigger all relevant events to complete loading
        ['loadstart', 'loadeddata', 'loadedmetadata', 'canplay', 'canplaythrough', 'load'].forEach(eventType => {
          const event = new Event(eventType, { bubbles: true });
          video.dispatchEvent(event);
        });
        
        // Also try to play the video if it's not already playing
        if (video.paused && video.autoplay) {
          video.play().catch(() => {
            console.log('🔇 Autoplay failed (expected in some browsers)');
          });
        }
      }
    });
    
    if (foundLoadingTask) {
      console.log('⚠️ Loading task still present after initial fix - trying alternative approach');
      
      // Try to find and trigger any loading context functions
      if (window.removeLoadingTask || window.__LOADING_CONTEXT__) {
        try {
          if (window.removeLoadingTask) {
            window.removeLoadingTask('hero-video');
            console.log('✅ Manually removed hero-video loading task');
          }
        } catch (e) {
          console.log('⚠️ Could not manually remove loading task');
        }
      }
      
      // Force a re-render by dispatching a custom event
      window.dispatchEvent(new CustomEvent('heroVideoComplete', { 
        detail: { forced: true } 
      }));
    } else {
      console.log('✅ No hero-video loading task found - appears to be working correctly');
    }
    
  }, 1000);
  
  // Final check after more time
  setTimeout(() => {
    const stillHasLoadingTask = Array.from(document.querySelectorAll('*')).some(el => 
      el.textContent && el.textContent.includes('hero-video')
    );
    
    if (stillHasLoadingTask) {
      console.log('❌ Hero video loading task still present after 5 seconds - manual intervention may be needed');
      
      // Try one more aggressive fix
      const videos = document.querySelectorAll('video[src^="data:"]');
      videos.forEach(video => {
        // Force a reload of the video element
        const currentSrc = video.src;
        video.src = '';
        setTimeout(() => {
          video.src = currentSrc;
          video.load();
        }, 100);
      });
    } else {
      console.log('✅ Hero video loading completed successfully!');
    }
  }, 5000);
};

// Auto-run the fix when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixHeroVideoLoading);
} else {
  fixHeroVideoLoading();
}

// Export for manual triggering
window.fixHeroVideoLoading = fixHeroVideoLoading;