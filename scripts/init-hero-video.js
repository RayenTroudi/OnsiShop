// Initialize a default hero video for testing
const { dbService } = require('./src/lib/database.ts');

async function initializeHeroVideo() {
  try {
    console.log('🎬 Initializing default hero video...');
    
    // Create a default video entry using the external Big Buck Bunny video
    const defaultVideoData = {
      filename: 'default-hero-video.mp4',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video/mp4',
      section: 'hero',
      alt: 'Default hero background video'
    };
    
    const mediaAsset = await dbService.createMediaAsset(defaultVideoData);
    
    if (mediaAsset) {
      console.log('✅ Media asset created:', mediaAsset.id);
      
      // Update the site content to reference this video
      const videoUrl = `/api/media/${mediaAsset.id}`;
      await dbService.upsertSiteContent('hero_background_video', videoUrl);
      
      console.log('✅ Site content updated with video URL:', videoUrl);
      console.log('🎉 Hero video initialization complete!');
    } else {
      console.error('❌ Failed to create media asset');
    }
    
  } catch (error) {
    console.error('❌ Error initializing hero video:', error);
  }
}

// Run the initialization
if (require.main === module) {
  initializeHeroVideo();
}

module.exports = { initializeHeroVideo };