const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugTranslations() {
  try {
    console.log('🔍 Debug: Checking specific translation keys...\n');

    const problematicKeys = ['hero_title', 'promo_title', 'about_title', 'nav_navigation'];

    for (const key of problematicKeys) {
      console.log(`🔍 Checking key: ${key}`);
      
      const translations = await prisma.translation.findMany({
        where: { key: key }
      });

      if (translations.length === 0) {
        console.log(`  ❌ No translations found for key: ${key}`);
      } else {
        translations.forEach(t => {
          console.log(`  ✅ ${t.language}: "${t.text}"`);
        });
      }
      console.log('');
    }

    // Also check total count of translations
    const totalCount = await prisma.translation.count();
    console.log(`📊 Total translations in database: ${totalCount}`);

    // Check French translations specifically
    const frenchCount = await prisma.translation.count({
      where: { language: 'fr' }
    });
    console.log(`🇫🇷 French translations: ${frenchCount}`);

  } catch (error) {
    console.error('❌ Error debugging translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTranslations();
