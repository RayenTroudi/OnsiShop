const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findMalformedText() {
  try {
    console.log('🔍 Looking for malformed text with trends and timeless...');
    
    // Check SiteContent
    const siteContent = await prisma.siteContent.findMany({
      where: {
        value: {
          contains: 'trends and timeless'
        }
      }
    });
    
    console.log('📋 SiteContent with malformed text:');
    siteContent.forEach(item => {
      console.log(`Key: ${item.key}`);
      console.log(`Value: ${JSON.stringify(item.value)}`);
      console.log('---');
    });
    
    // Check translations too
    const translations = await prisma.translation.findMany({
      where: {
        text: {
          contains: 'trends and timeless'
        }
      }
    });
    
    console.log('📝 Translations with malformed text:');
    translations.forEach(item => {
      console.log(`Language: ${item.language}`);
      console.log(`Key: ${item.key}`);
      console.log(`Text: ${JSON.stringify(item.text)}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findMalformedText();