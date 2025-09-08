const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const missingKeys = [
  // Keys that are used in components but missing from database
  {
    key: 'promo_free_shipping',
    translations: {
      en: 'Free shipping on orders over $50',
      fr: 'Livraison gratuite sur les commandes de plus de 50$',
      ar: 'شحن مجاني على الطلبات أكثر من 50 دولار'
    }
  },
  {
    key: 'section_about_us_title', 
    translations: {
      en: 'About Us',
      fr: 'À Propos de Nous',
      ar: 'من نحن'
    }
  },
  {
    key: 'about_button_text',
    translations: {
      en: 'Learn More',
      fr: 'En Savoir Plus', 
      ar: 'اعرف المزيد'
    }
  },
  {
    key: 'section_best_sellers',
    translations: {
      en: 'Best Sellers',
      fr: 'Meilleures Ventes',
      ar: 'الأكثر مبيعاً'
    }
  }
];

async function addMissingKeys() {
  try {
    console.log('🔧 Adding missing translation keys...\n');

    let addedCount = 0;

    for (const item of missingKeys) {
      console.log(`📝 Adding translations for "${item.key}":`);
      
      for (const [language, text] of Object.entries(item.translations)) {
        try {
          const translation = await prisma.translation.upsert({
            where: {
              key_language: {
                key: item.key,
                language: language
              }
            },
            update: {
              text: text
            },
            create: {
              key: item.key,
              language: language,
              text: text
            }
          });

          console.log(`  ✅ ${language}: "${text}"`);
          addedCount++;
        } catch (error) {
          console.log(`  ❌ ${language}: Failed - ${error.message}`);
        }
      }
      console.log('');
    }

    console.log(`\n🎉 Successfully added/updated ${addedCount} translation entries!`);
    return true;

  } catch (error) {
    console.error('❌ Error adding missing keys:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

addMissingKeys()
  .then(success => {
    if (success) {
      console.log('\n✅ Missing keys added successfully!');
    } else {
      console.log('\n❌ Failed to add missing keys.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
