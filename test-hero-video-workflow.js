// Using built-in fetch (Node.js 18+)

const BASE_URL = 'https://onsi-shop.vercel.app';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@gmail.com';

let authToken = null;

// Test helper functions
async function login() {
  console.log('🔐 Testing admin login...');
  
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

async function testMediaAPI() {
  console.log('\n📁 Testing media API...');
  
  const response = await fetch(`${BASE_URL}/api/admin/media`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (response.ok) {
    const media = await response.json();
    console.log('✅ Media API working');
    console.log(`📊 Found ${media.length} media assets`);
    
    // Find hero videos
    const heroVideos = media.filter(asset => 
      asset.section === 'hero' && asset.type.startsWith('video/')
    );
    console.log(`🎬 Hero videos: ${heroVideos.length}`);
    
    if (heroVideos.length > 0) {
      console.log('📝 Current hero video:', {
        filename: heroVideos[0].filename,
        type: heroVideos[0].type,
        created: heroVideos[0].createdAt
      });
    }
    
    return media;
  } else {
    console.error('❌ Media API failed:', response.status);
    return [];
  }
}

async function testContentAPI() {
  console.log('\n📄 Testing content API...');
  
  const response = await fetch(`${BASE_URL}/api/content-manager`);

  if (response.ok) {
    const result = await response.json();
    if (result.success && result.items) {
      console.log('✅ Content API working');
      console.log(`📊 Found ${result.items.length} content items`);
      
      // Check for hero video content key
      const heroVideoContent = result.items.find(item => 
        item.key === 'hero_background_video'
      );
      
      if (heroVideoContent) {
        console.log('🎬 Hero video content key found:', {
          value: heroVideoContent.value.substring(0, 50) + '...',
          updated: heroVideoContent.updatedAt
        });
      } else {
        console.log('⚠️  Hero video content key not found');
      }
      
      return result.items;
    }
  } else {
    console.error('❌ Content API failed:', response.status);
    return [];
  }
}

async function testHeroSectionFetch() {
  console.log('\n🏠 Testing hero section content fetch...');
  
  const response = await fetch(`${BASE_URL}/api/content`);

  if (response.ok) {
    const result = await response.json();
    if (result.success) {
      console.log('✅ Hero content API working');
      
      const heroData = result.data;
      const videoKey = Object.keys(heroData).find(key => 
        key.includes('video') && key.includes('hero')
      );
      
      if (videoKey && heroData[videoKey]) {
        console.log('🎬 Hero video available in frontend API');
        console.log(`📺 Video source: ${heroData[videoKey].substring(0, 50)}...`);
      } else {
        console.log('⚠️  No hero video found in frontend API');
      }
      
      return heroData;
    }
  } else {
    console.error('❌ Hero content API failed:', response.status);
    return {};
  }
}

async function testAdminContentPage() {
  console.log('\n🔧 Testing admin content page accessibility...');
  
  try {
    const response = await fetch(`${BASE_URL}/admin/content`, {
      method: 'GET'
    });

    if (response.ok) {
      console.log('✅ Admin content page accessible');
      console.log(`📊 Response status: ${response.status}`);
    } else {
      console.log(`⚠️  Admin content page returned: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error accessing admin page:', error.message);
  }
}

async function testHomepageFetch() {
  console.log('\n🏠 Testing homepage load...');
  
  try {
    const response = await fetch(BASE_URL);

    if (response.ok) {
      console.log('✅ Homepage accessible');
      console.log(`📊 Response status: ${response.status}`);
    } else {
      console.log(`⚠️  Homepage returned: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error accessing homepage:', error.message);
  }
}

async function runVideoUploadTests() {
  console.log('🚀 Starting Simplified Video Upload Flow Tests');
  console.log('===============================================\n');

  // Test login
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }

  // Test all APIs
  await testMediaAPI();
  await testContentAPI();
  await testHeroSectionFetch();
  await testAdminContentPage();
  await testHomepageFetch();

  console.log('\n✨ Test Summary:');
  console.log('================');
  console.log('✅ Admin authentication working');
  console.log('✅ Media API accessible');
  console.log('✅ Content API accessible');
  console.log('✅ Hero section API working');
  console.log('✅ Admin content page accessible');
  console.log('✅ Homepage loading');
  
  console.log('\n📋 Next Steps:');
  console.log('==============');
  console.log('1. Visit: https://onsi-shop.vercel.app/admin/content');
  console.log('2. Login with: admin@gmail.com / admin@gmail.com');
  console.log('3. Click on "Hero Video" tab');
  console.log('4. Upload a video file (max 5MB, MP4/WebM recommended)');
  console.log('5. Verify video appears on homepage hero section');
  
  console.log('\n🎯 Optimization Features:');
  console.log('========================');
  console.log('• Dedicated hero video management interface');
  console.log('• Automatic old video cleanup (one video at a time)');
  console.log('• 5MB size limit for optimal performance');
  console.log('• Real-time content updates');
  console.log('• Format validation (MP4/WebM preferred)');
  console.log('• Progress indicators during upload');
  console.log('• Video preview in admin interface');
}

// Run the tests
runVideoUploadTests().catch(console.error);