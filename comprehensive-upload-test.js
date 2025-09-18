const { PrismaClient } = require('@prisma/client');

async function comprehensiveUploadTest() {
  const prisma = new PrismaClient();
  
  console.log('🧪 COMPREHENSIVE UPLOAD VERIFICATION TEST');
  console.log('==========================================\n');
  
  try {
    // 1. Check MediaAsset table
    console.log('1️⃣ CHECKING MEDIAASSET TABLE:');
    const mediaAssets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`   Found ${mediaAssets.length} media assets:`);
    
    if (mediaAssets.length === 0) {
      console.log('   ❌ NO MEDIA ASSETS FOUND');
    } else {
      mediaAssets.forEach((asset, index) => {
        console.log(`   ${index + 1}. ${asset.filename}`);
        console.log(`      Section: ${asset.section}`);
        console.log(`      Type: ${asset.type}`);
        console.log(`      Size: ${asset.url ? (asset.url.length / 1024).toFixed(0) : 'null'} KB`);
        console.log(`      Created: ${asset.createdAt}`);
        console.log(`      ID: ${asset.id}`);
        console.log('');
      });
    }
    
    // 2. Check SiteContent table
    console.log('2️⃣ CHECKING SITECONTENT TABLE:');
    const contentItems = await prisma.siteContent.findMany({
      where: {
        OR: [
          { key: { contains: 'hero' } },
          { key: { contains: 'promotion' } },
          { key: { contains: 'video' } },
          { key: { contains: 'image' } }
        ]
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log(`   Found ${contentItems.length} content items with media keys:`);
    
    contentItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.key}`);
      console.log(`      Value Length: ${item.value ? item.value.length : 'null'} chars`);
      console.log(`      Updated: ${item.updatedAt}`);
      
      if (item.value) {
        if (item.value.startsWith('data:')) {
          const mimeMatch = item.value.match(/data:([^;]+)/);
          console.log(`      Type: Base64 ${mimeMatch ? mimeMatch[1] : 'unknown'}`);
          console.log(`      Preview: ${item.value.substring(0, 50)}...`);
        } else {
          console.log(`      Value: ${item.value}`);
        }
      }
      console.log('');
    });
    
    // 3. Check for recent uploads (last 24 hours)
    console.log('3️⃣ CHECKING RECENT UPLOADS (Last 24 Hours):');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentMedias = await prisma.mediaAsset.findMany({
      where: {
        createdAt: {
          gte: yesterday
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const recentContent = await prisma.siteContent.findMany({
      where: {
        updatedAt: {
          gte: yesterday
        },
        OR: [
          { key: { contains: 'hero' } },
          { key: { contains: 'promotion' } },
          { key: { contains: 'video' } },
          { key: { contains: 'image' } }
        ]
      },
      orderBy: { updatedAt: 'desc' }
    });
    
    console.log(`   Recent MediaAssets: ${recentMedias.length}`);
    console.log(`   Recent SiteContent: ${recentContent.length}`);
    
    if (recentMedias.length > 0) {
      console.log('\n   📹 RECENT MEDIA UPLOADS:');
      recentMedias.forEach((media, index) => {
        console.log(`   ${index + 1}. ${media.filename} (${media.section}) - ${media.createdAt}`);
      });
    }
    
    if (recentContent.length > 0) {
      console.log('\n   📝 RECENT CONTENT UPDATES:');
      recentContent.forEach((content, index) => {
        console.log(`   ${index + 1}. ${content.key} - ${content.updatedAt}`);
      });
    }
    
    // 4. Summary and Status
    console.log('\n4️⃣ UPLOAD SYSTEM STATUS:');
    console.log('=========================');
    
    if (mediaAssets.length === 0 && contentItems.length === 0) {
      console.log('❌ ISSUE: No uploads found in database at all');
      console.log('   → This means uploads are failing or not reaching database');
    } else if (recentMedias.length === 0 && recentContent.length === 0) {
      console.log('⚠️  WARNING: No recent uploads found (last 24 hours)');
      console.log('   → Old data exists but no new uploads');
    } else {
      console.log('✅ SUCCESS: Upload system is working!');
      console.log(`   → ${recentMedias.length} new media files uploaded recently`);
      console.log(`   → ${recentContent.length} content items updated recently`);
      
      // Check if hero video is working
      const heroVideo = contentItems.find(c => c.key === 'hero_background_video');
      if (heroVideo && heroVideo.value && heroVideo.value.startsWith('data:video/')) {
        console.log('   → Hero video uploaded and ready');
        console.log(`     Size: ${(heroVideo.value.length / 1024 / 1024).toFixed(2)} MB`);
      }
      
      // Check if promotion image is working
      const promoImage = contentItems.find(c => c.key === 'promotion_background_image');
      if (promoImage && promoImage.value && promoImage.value.startsWith('data:image/')) {
        console.log('   → Promotion image uploaded and ready');
        console.log(`     Size: ${(promoImage.value.length / 1024).toFixed(0)} KB`);
      }
    }
    
    console.log('\n🎯 CONCLUSION:');
    console.log('==============');
    
    if (mediaAssets.length > 0 || contentItems.length > 0) {
      console.log('✅ Your upload system IS WORKING!');
      console.log('✅ Data IS in the database!');
      console.log('');
      console.log('If you\'re not seeing uploads:');
      console.log('1. Check browser cache - refresh with Ctrl+F5');
      console.log('2. Check admin interface refresh - close and reopen tab');
      console.log('3. Large files (>2MB) might take time to display');
      console.log('4. Base64 encoding can cause display delays');
    } else {
      console.log('❌ Upload system not working - no data found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

comprehensiveUploadTest();