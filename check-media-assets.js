const { PrismaClient } = require('@prisma/client');

async function checkMediaAssets() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking MediaAssets table...');
    
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log(`Found ${assets.length} media assets:`);
    
    if (assets.length === 0) {
      console.log('❌ No media assets found in database');
    } else {
      assets.forEach((asset, index) => {
        console.log(`\n${index + 1}. Media Asset:`);
        console.log(`   ID: ${asset.id}`);
        console.log(`   File: ${asset.filename}`);
        console.log(`   Section: ${asset.section}`);
        console.log(`   Type: ${asset.type}`);
        console.log(`   URL Length: ${asset.url ? asset.url.length : 'null'} chars`);
        console.log(`   Created: ${asset.createdAt}`);
        console.log(`   Updated: ${asset.updatedAt}`);
      });
    }

    // Also check SiteContent for media references
    console.log('\n🔍 Checking SiteContent for media references...');
    const content = await prisma.siteContent.findMany({
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

    console.log(`Found ${content.length} content entries with media keys:`);
    content.forEach((item, index) => {
      console.log(`\n${index + 1}. Content:`);
      console.log(`   Key: ${item.key}`);
      console.log(`   Value Length: ${item.value ? item.value.length : 'null'} chars`);
      console.log(`   Updated: ${item.updatedAt}`);
    });

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMediaAssets();