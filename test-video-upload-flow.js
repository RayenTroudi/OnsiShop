// Using built-in fetch (Node.js 18+)

const BASE_URL = 'https://onsi-shop.vercel.app';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@gmail.com';

let authToken = null;

async function login() {
  console.log('🔐 Logging in...');
  
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
  });

  const result = await response.json();
  
  if (response.ok && result.token) {
    authToken = result.token;
    console.log('✅ Login successful');
    return true;
  } else {
    console.error('❌ Login failed:', result);
    return false;
  }
}

async function createTestVideoFile() {
  // Create a small test video data (base64 encoded minimal MP4)
  // This is a minimal 1-frame MP4 video (very small, around 300 bytes)
  const minimalMp4Base64 = 'AAAAHGZ0eXBtcDQyAAAAAAAAAAABbXA0MgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGZ0eXBtcDQyAAAAAAABbXA0MgAAAAA=';
  
  // Convert base64 to blob
  const binaryString = atob(minimalMp4Base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: 'video/mp4' });
}

async function testVideoUploadFlow() {
  console.log('🎬 Testing Complete Video Upload Flow');
  console.log('=====================================\n');

  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  console.log('1. Creating test video file...');
  const testVideoBlob = await createTestVideoFile();
  console.log(`✅ Test video created (${testVideoBlob.size} bytes)`);

  console.log('\n2. Testing video upload...');
  try {
    const formData = new FormData();
    formData.append('file', testVideoBlob, 'test-hero-video.mp4');
    formData.append('section', 'hero');
    formData.append('alt', 'Test hero background video');

    const uploadResponse = await fetch(`${BASE_URL}/api/admin/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData,
    });

    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json();
      console.log('✅ Video upload successful');
      console.log('📄 Upload result:', {
        id: uploadResult.id,
        filename: uploadResult.filename,
        type: uploadResult.type,
        section: uploadResult.section
      });

      // Wait a moment for the content update to propagate
      console.log('\n3. Waiting for content propagation...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if content was updated
      console.log('\n4. Verifying content update...');
      const contentResponse = await fetch(`${BASE_URL}/api/content`);
      const contentResult = await contentResponse.json();
      
      if (contentResult.success) {
        const heroVideo = contentResult.data.hero_background_video;
        if (heroVideo && heroVideo !== '') {
          console.log('✅ Hero video content updated successfully');
          console.log('📺 Video URL:', heroVideo.substring(0, 100) + '...');
        } else {
          console.log('❌ Hero video content is still empty');
          console.log('🔍 This suggests the media API did not update the content key properly');
        }
      }

      // Check media endpoint
      console.log('\n5. Verifying media storage...');
      const mediaResponse = await fetch(`${BASE_URL}/api/admin/media`);
      const mediaResult = await mediaResponse.json();
      
      const heroVideos = mediaResult.filter(asset => 
        asset.section === 'hero' && asset.type.startsWith('video/')
      );
      
      if (heroVideos.length > 0) {
        console.log('✅ Hero video found in media storage');
        console.log('📹 Video details:', {
          id: heroVideos[0].id,
          filename: heroVideos[0].filename,
          created: heroVideos[0].createdAt
        });
      } else {
        console.log('❌ No hero video found in media storage');
      }

    } else {
      console.log('❌ Video upload failed');
      const errorText = await uploadResponse.text();
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.error('❌ Upload test failed:', error.message);
  }

  console.log('\n🎯 Test Summary');
  console.log('===============');
  console.log('This test simulates uploading a tiny video file to verify:');
  console.log('1. Authentication works');
  console.log('2. Media upload endpoint accepts the file');
  console.log('3. Content key is updated automatically');
  console.log('4. Video appears in media storage');
  console.log('');
  console.log('If any step fails, that indicates where the issue is.');
}

// Run the test
testVideoUploadFlow().catch(console.error);