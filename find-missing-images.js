require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function findMissingImageReferences() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Searching for missing image references...\n');
    
    // 1. Check SiteContent for image references
    console.log('📋 SITE CONTENT:');
    const siteContent = await prisma.siteContent.findMany();
    const imageRefs = siteContent.filter(content => 
      content.value.includes('.jpg') || 
      content.value.includes('.png') || 
      content.value.includes('.webp') ||
      content.value.includes('/images/') ||
      content.value.includes('/uploads/')
    );
    
    imageRefs.forEach(ref => {
      console.log(`- ${ref.key}: ${ref.value}`);
    });
    
    // 2. Check MediaAssets table
    console.log('\n📋 MEDIA ASSETS:');
    const mediaAssets = await prisma.mediaAsset.findMany();
    mediaAssets.forEach(asset => {
      console.log(`- ${asset.filename}: ${asset.url} (type: ${asset.type})`);
    });
    
    // 3. Check for specific missing images
    console.log('\n❌ MISSING IMAGES FOUND:');
    const missingImages = [
      '/images/promotions/winter.jpg',
      '/images/background-image-1756043891412-0nifzaa2fwm.PNG',
      '/uploads/1756809700099-ody6en5rc9h.webp'
    ];
    
    for (const imagePath of missingImages) {
      const inSiteContent = siteContent.find(content => content.value === imagePath);
      const inMediaAssets = mediaAssets.find(asset => asset.url === imagePath);
      
      console.log(`\n🔍 ${imagePath}:`);
      console.log(`  - In SiteContent: ${inSiteContent ? `YES (${inSiteContent.key})` : 'NO'}`);
      console.log(`  - In MediaAssets: ${inMediaAssets ? `YES (${inMediaAssets.filename})` : 'NO'}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findMissingImageReferences();
