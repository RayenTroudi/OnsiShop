// Quick check of database translations
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database for missing translations...');
    
    const missingKeys = [
      'promo_free_shipping',
      'footer_copyright', 
      'footer_all_rights_reserved',
      'footer_disclaimer_title',
      'footer_disclaimer_text'
    ];
    
    for (const key of missingKeys) {
      const frTranslation = await prisma.translation.findUnique({
        where: {
          key_language: {
            key: key,
            language: 'fr'
          }
        }
      });
      
      if (frTranslation) {
        console.log(`✅ ${key}: "${frTranslation.text}"`);
      } else {
        console.log(`❌ ${key}: NOT FOUND`);
      }
    }
    
    // Also check total count
    const totalFrench = await prisma.translation.count({
      where: { language: 'fr' }
    });
    
    console.log(`\n📊 Total French translations in database: ${totalFrench}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
