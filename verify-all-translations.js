const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyTranslations() {
  try {
    console.log('🔍 Verifying all translation keys are present...\n');

    // List all keys we expect to be present for hero, promo, about, footer, and navigation
    const requiredKeys = [
      // Hero section
      'hero_title',
      'hero_subtitle', 
      'hero_description',
      'hero_alt_text',
      'loading_video',
      
      // Promo section
      'promo_title',
      'promo_subtitle',
      'promo_button',
      
      // About section
      'about_title',
      'about_description',
      'about_button',
      
      // Footer section
      'footer_copyright',
      'footer_all_rights_reserved',
      'footer_disclaimer_title',
      'footer_disclaimer_text',
      
      // Navigation
      'nav_navigation',
      'nav_follow_us',
      
      // Menu items
      'nav_best_sellers',
      'nav_new_arrivals', 
      'nav_clothing',
      'nav_accessories'
    ];

    const languages = ['en', 'fr', 'ar'];
    let missingKeys = [];
    let totalChecked = 0;
    let foundCount = 0;

    for (const lang of languages) {
      console.log(`\n📋 Checking ${lang.toUpperCase()} translations:`);
      
      for (const key of requiredKeys) {
        totalChecked++;
        const translation = await prisma.translation.findUnique({
          where: {
            key_language: {
              key: key,
              language: lang
            }
          }
        });

        if (translation) {
          console.log(`  ✅ ${key}: "${translation.text}"`);
          foundCount++;
        } else {
          console.log(`  ❌ ${key}: MISSING`);
          missingKeys.push(`${key} (${lang})`);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`Total checked: ${totalChecked}`);
    console.log(`Found: ${foundCount}`);
    console.log(`Missing: ${missingKeys.length}`);

    if (missingKeys.length > 0) {
      console.log(`\n❌ Missing translation keys:`);
      missingKeys.forEach(key => console.log(`  - ${key}`));
    } else {
      console.log(`\n🎉 All translation keys are present!`);
    }

    return missingKeys.length === 0;

  } catch (error) {
    console.error('❌ Error verifying translations:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

verifyTranslations()
  .then(success => {
    if (success) {
      console.log('\n✅ Translation verification complete - all keys found!');
    } else {
      console.log('\n⚠️  Translation verification found missing keys.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
