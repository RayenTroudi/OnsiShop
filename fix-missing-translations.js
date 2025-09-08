// Fix missing translations
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Missing translations that need to be added
const translations = [
  {
    key: 'promo_free_shipping',
    fr: 'Livraison gratuite',
    en: 'Free shipping',
    ar: 'شحن مجاني'
  },
  {
    key: 'footer_copyright',
    fr: 'Copyright © 2023 Rashid Shamloo',
    en: 'Copyright © 2023 Rashid Shamloo',
    ar: 'حقوق الطبع والنشر © 2023 رشيد شاملو'
  },
  {
    key: 'footer_all_rights_reserved',
    fr: 'Tous droits réservés',
    en: 'All Rights Reserved',
    ar: 'جميع الحقوق محفوظة'
  },
  {
    key: 'footer_disclaimer_title',
    fr: 'Avertissement',
    en: 'Disclaimer',
    ar: 'إخلاء المسؤولية'
  },
  {
    key: 'footer_disclaimer_text',
    fr: 'Tous les produits de ce site sont à des fins de démonstration seulement. Les images et informations des produits sont protégées par le droit d\'auteur de leurs propriétaires respectifs.',
    en: 'All products on this site are for demo purposes only. The product images and information are copyrighted to their respective owners.',
    ar: 'جميع المنتجات في هذا الموقع لأغراض العرض التوضيحي فقط. صور ومعلومات المنتجات محمية بحقوق النشر لأصحابها المعنيين.'
  }
];

async function fixMissingTranslations() {
  try {
    console.log('🔧 Fixing missing translations...');

    for (const translation of translations) {
      // Insert French translation
      await prisma.translation.upsert({
        where: {
          key_language: {
            key: translation.key,
            language: 'fr'
          }
        },
        update: {
          text: translation.fr
        },
        create: {
          key: translation.key,
          language: 'fr',
          text: translation.fr
        }
      });

      // Insert English translation
      await prisma.translation.upsert({
        where: {
          key_language: {
            key: translation.key,
            language: 'en'
          }
        },
        update: {
          text: translation.en
        },
        create: {
          key: translation.key,
          language: 'en',
          text: translation.en
        }
      });

      // Insert Arabic translation
      await prisma.translation.upsert({
        where: {
          key_language: {
            key: translation.key,
            language: 'ar'
          }
        },
        update: {
          text: translation.ar
        },
        create: {
          key: translation.key,
          language: 'ar',
          text: translation.ar
        }
      });
    }

    console.log(`✅ Successfully fixed: ${translations.length} missing translation keys`);
    
    // Verify the translations were added
    console.log('\n🔍 Verifying translations...');
    for (const translation of translations) {
      const frTranslation = await prisma.translation.findUnique({
        where: {
          key_language: {
            key: translation.key,
            language: 'fr'
          }
        }
      });
      
      if (frTranslation) {
        console.log(`✅ ${translation.key} (FR): "${frTranslation.text}"`);
      } else {
        console.log(`❌ ${translation.key} (FR): Still missing!`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixMissingTranslations();
