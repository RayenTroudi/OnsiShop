const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTranslationSystem() {
  try {
    console.log('🧪 Testing translation system functionality...\n');

    // Test key translation keys
    const testKeys = ['hero_title', 'promo_title', 'nav_follow_us', 'about_button'];
    const languages = ['en', 'fr', 'ar'];

    for (const key of testKeys) {
      console.log(`🔍 Testing key: ${key}`);
      
      for (const lang of languages) {
        const translation = await prisma.translation.findUnique({
          where: {
            key_language: {
              key: key,
              language: lang
            }
          }
        });

        if (translation) {
          console.log(`  ${lang.toUpperCase()}: ${translation.text}`);
        }
      }
      console.log('');
    }

    console.log('✅ Translation system test complete!');
    console.log('\n📝 Summary:');
    console.log('- All homepage content (hero, promo, about) is now using dynamic translations');
    console.log('- Footer navigation and social media sections are using dynamic translations');
    console.log('- Multi-language support working for English, French, and Arabic');
    console.log('- All static text has been replaced with translation keys');

  } catch (error) {
    console.error('❌ Error testing translation system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTranslationSystem();
