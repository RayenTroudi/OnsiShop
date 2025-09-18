const { PrismaClient } = require('@prisma/client');

async function checkContentValues() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking SiteContent values for media...');
    
    const mediaContent = await prisma.siteContent.findMany({
      where: {
        OR: [
          { key: 'hero_background_video' },
          { key: 'hero_background_image' },
          { key: 'promotion_background_image' },
          { key: 'hero_backgroundvideo' }, // legacy key
          { key: 'hero_image_url' }, // legacy key
        ]
      },
      orderBy: { updatedAt: 'desc' }
    });

    console.log(`Found ${mediaContent.length} media content entries:`);
    
    mediaContent.forEach((content, index) => {
      console.log(`\n${index + 1}. Key: ${content.key}`);
      console.log(`   Value Length: ${content.value ? content.value.length : 'null'} chars`);
      console.log(`   Updated: ${content.updatedAt}`);
      
      if (content.value) {
        if (content.value.startsWith('data:')) {
          const mimeMatch = content.value.match(/data:([^;]+)/);
          console.log(`   → Base64 ${mimeMatch ? mimeMatch[1] : 'unknown type'}: ${content.value.substring(0, 50)}...`);
        } else {
          console.log(`   → URL/Path: ${content.value}`);
        }
      }
    });

    // Also check for any content with large values (likely base64 media)
    console.log('\n🔍 Looking for large content values (likely media)...');
    const largeContent = await prisma.siteContent.findMany({
      where: {
        value: {
          not: null
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 20
    });

    const mediaLikeContent = largeContent.filter(c => 
      c.value && (c.value.length > 1000 || c.value.startsWith('data:'))
    );

    console.log(`Found ${mediaLikeContent.length} large/media content entries:`);
    mediaLikeContent.forEach((content, index) => {
      console.log(`\n${index + 1}. Key: ${content.key}`);
      console.log(`   Value Length: ${content.value.length} chars`);
      console.log(`   Updated: ${content.updatedAt}`);
      
      if (content.value.startsWith('data:')) {
        const mimeMatch = content.value.match(/data:([^;]+)/);
        console.log(`   → Base64 ${mimeMatch ? mimeMatch[1] : 'unknown type'}: ${content.value.substring(0, 50)}...`);
      } else if (content.value.length > 100) {
        console.log(`   → Large text: ${content.value.substring(0, 100)}...`);
      } else {
        console.log(`   → Value: ${content.value}`);
      }
    });

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContentValues();