// Test hero video loading completion
const testHeroVideoLoading = () => {
  console.log('🧪 Testing hero video loading...');
  
  // Wait for page to fully load
  setTimeout(() => {
    // Check loading context state
    const loadingIndicators = document.querySelectorAll('[data-loading="true"]');
    const loadingTexts = document.querySelectorAll('*');
    
    console.log(`📊 Found ${loadingIndicators.length} loading indicators`);
    
    // Look for loading tasks
    let foundLoadingTask = false;
    loadingTexts.forEach(el => {
      if (el.textContent && el.textContent.includes('hero-video')) {
        console.log('🔍 Found hero-video loading task:', el.textContent);
        foundLoadingTask = true;
      }
    });
    
    // Check video elements
    const videoElements = document.querySelectorAll('video');
    console.log(`🎬 Found ${videoElements.length} video elements`);
    
    videoElements.forEach((video, index) => {
      console.log(`Video ${index + 1}:`, {
        src: video.src ? video.src.substring(0, 100) + '...' : 'No src',
        readyState: video.readyState,
        duration: video.duration,
        paused: video.paused,
        ended: video.ended,
        error: video.error ? video.error.message : 'No error'
      });
      
      // Check if video has data: URL (cached)
      if (video.src && video.src.startsWith('data:')) {
        console.log('📦 Video is served from cache (data URL)');
        
        // Check if video is ready to play
        if (video.readyState >= 3) { // HAVE_FUTURE_DATA or higher
          console.log('✅ Video is ready to play');
          
          // Simulate onLoad event if not already fired
          if (video.paused && !foundLoadingTask) {
            console.log('🚀 Triggering video load completion');
            video.dispatchEvent(new Event('canplaythrough'));
          }
        }
      }
    });
    
    if (!foundLoadingTask) {
      console.log('✅ No hero-video loading task found - loading completed successfully!');
    } else {
      console.log('⚠️ Hero-video loading task still active');
    }
    
  }, 2000);
  
  // Check again after more time
  setTimeout(() => {
    const stillLoading = Array.from(document.querySelectorAll('*')).some(el => 
      el.textContent && el.textContent.includes('hero-video')
    );
    
    if (stillLoading) {
      console.log('❌ Hero video still loading after 5 seconds');
    } else {
      console.log('✅ Hero video loading completed within 5 seconds');
    }
  }, 5000);
};

// Run the test
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testHeroVideoLoading);
} else {
  testHeroVideoLoading();
}