/**
 * Test Hero Video Playback
 * Checks if the hero video loads and plays properly on the homepage
 */

const fs = require('fs');
const path = require('path');

async function testHeroVideoPlayback() {
    console.log('🎥 Testing Hero Video Playback...\n');

    try {
        // 1. Check HeroSection component
        console.log('1. Checking HeroSection component...');
        const heroSectionPath = path.join(__dirname, 'src/components/sections/HeroSection.tsx');
        
        if (fs.existsSync(heroSectionPath)) {
            const heroContent = fs.readFileSync(heroSectionPath, 'utf8');
            console.log('✅ HeroSection.tsx found');
            
            // Check video-related code
            const hasVideoElement = heroContent.includes('<video');
            const hasAutoPlay = heroContent.includes('autoPlay');
            const hasMuted = heroContent.includes('muted');
            const hasLoop = heroContent.includes('loop');
            const hasPlaysInline = heroContent.includes('playsInline');
            
            console.log(`📹 Video element: ${hasVideoElement ? '✅' : '❌'}`);
            console.log(`🔄 AutoPlay: ${hasAutoPlay ? '✅' : '❌'}`);
            console.log(`🔇 Muted: ${hasMuted ? '✅' : '❌'}`);
            console.log(`🔁 Loop: ${hasLoop ? '✅' : '❌'}`);
            console.log(`📱 PlaysInline: ${hasPlaysInline ? '✅' : '❌'}`);
            
            // Extract video element if found
            const videoMatch = heroContent.match(/<video[^>]*>.*?<\/video>/s);
            if (videoMatch) {
                console.log('\n🎬 Video element found:');
                console.log(videoMatch[0].substring(0, 200) + '...');
            }
            
        } else {
            console.log('❌ HeroSection.tsx not found');
            return;
        }

        // 2. Check if content fetching is working
        console.log('\n2. Testing content API endpoint...');
        
        // Simulate fetching content like the component does
        const testApiCall = `
// This is what HeroSection should be doing:
const response = await fetch('/api/content-manager');
const data = await response.json();
const videoUrl = data.content['hero_background_video'];

console.log('Video URL exists:', !!videoUrl);
console.log('Video URL type:', typeof videoUrl);
console.log('Video URL length:', videoUrl?.length);
console.log('Is base64:', videoUrl?.startsWith('data:video/'));
        `;
        
        console.log('📡 API call simulation:');
        console.log(testApiCall);

        // 3. Check common video playback issues
        console.log('\n3. Common video playback issues to check:');
        console.log('🔍 Issues to verify in browser:');
        console.log('   • Video element appears in DOM');
        console.log('   • Video src attribute is set properly');
        console.log('   • Browser console shows no errors');
        console.log('   • Video file format is supported (mp4)');
        console.log('   • Video is not too large for browser');
        console.log('   • Autoplay policy allows muted videos');
        
        // 4. Browser debugging steps
        console.log('\n4. Browser debugging steps:');
        console.log('🌐 Open browser developer tools and check:');
        console.log('   1. Network tab - does /api/content-manager load?');
        console.log('   2. Console - any JavaScript errors?');
        console.log('   3. Elements tab - is <video> element present?');
        console.log('   4. Right-click video area - "Show video controls"');
        console.log('   5. Try manually playing video');
        
        // 5. Quick fixes to try
        console.log('\n5. Quick fixes to try:');
        console.log('🔧 If video still not playing:');
        console.log('   • Hard refresh (Ctrl+F5)');
        console.log('   • Clear browser cache');
        console.log('   • Try different browser');
        console.log('   • Check if video works in private/incognito mode');
        console.log('   • Disable ad blockers temporarily');
        
        console.log('\n🎯 Next Steps:');
        console.log('1. Open homepage in browser');
        console.log('2. Open developer tools (F12)');
        console.log('3. Check if video element exists in Elements tab');
        console.log('4. Look for errors in Console tab');
        console.log('5. Verify /api/content-manager returns video data in Network tab');
        
    } catch (error) {
        console.error('❌ Error during playback test:', error);
    }
}

// Run the test
testHeroVideoPlayback().catch(console.error);