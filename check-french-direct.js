const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFrenchTranslations() {
  try {
    console.log('🔍 Checking French translations directly from database...\n');

    // Get all French translations
    const frenchTranslations = await prisma.Translation.findMany({
      where: { language: 'fr' },
      select: { key: true, text: true }
    });

    console.log(`📊 Total French translations in database: ${frenchTranslations.length}`);

    // Check specific problematic keys
    const problematicKeys = [
      'hero_title', 'hero_subtitle', 'hero_description', 'hero_alt_text',
      'promo_title', 'promo_subtitle', 'promo_button', 'promo_free_shipping',
      'about_title', 'about_description', 'about_button_text', 'section_about_us_title',
      'nav_navigation', 'nav_follow_us', 
      'footer_copyright', 'footer_all_rights_reserved', 'footer_disclaimer_title', 'footer_disclaimer_text'
    ];

    console.log('\n🔍 Checking specific problematic keys:');
    for (const key of problematicKeys) {
      const translation = frenchTranslations.find(t => t.key === key);
      if (translation) {
        console.log(`  ✅ ${key}: "${translation.text}"`);
      } else {
        console.log(`  ❌ ${key}: NOT FOUND`);
      }
    }

    // Check total count by language
    const counts = await prisma.Translation.groupBy({
      by: ['language'],
      _count: {
        id: true
      }
    });

    console.log('\n📊 Translation counts by language:');
    counts.forEach(count => {
      console.log(`  ${count.language}: ${count._count.id} translations`);
    });

  } catch (error) {
    console.error('❌ Error checking translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFrenchTranslations();
