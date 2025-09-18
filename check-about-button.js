const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAboutButton() {
  try {
    console.log('🔍 Checking for about_button_text issue...');
    
    // Check SiteContent table for malformed entries
    const siteContent = await prisma.siteContent.findMany({
      where: {
        OR: [
          { key: { contains: 'about_button' } },
          { value: { contains: 'about_button_text' } }
        ]
      }
    });
    
    console.log('📋 SiteContent with about_button:');
    siteContent.forEach(item => {
      console.log(`  Key: ${item.key}`);
      console.log(`  Value: ${item.value}`);
      console.log('  ---');
    });
    
    // Check Translation table
    const translations = await prisma.translation.findMany({
      where: {
        OR: [
          { key: { contains: 'about_button' } },
          { text: { contains: 'about_button_text' } }
        ]
      }
    });
    
    console.log('📝 Translations with about_button:');
    translations.forEach(item => {
      console.log(`  Language: ${item.language}`);
      console.log(`  Key: ${item.key}`);
      console.log(`  Text: ${item.text}`);
      console.log('  ---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAboutButton();