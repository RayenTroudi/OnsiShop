import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingEnglishTranslations() {
  console.log('🔄 Adding missing English translations...');

  const missingTranslations = [
    {
      key: 'nav_products',
      translations: {
        en: 'Products',
        fr: 'Produits',
        ar: 'المنتجات'
      }
    },
    {
      key: 'product_in_stock',
      translations: {
        en: 'In Stock',
        fr: 'En stock',
        ar: 'متوفر'
      }
    }
  ];

  try {
    for (const translationSet of missingTranslations) {
      console.log(`🔄 Processing key: ${translationSet.key}`);
      
      // Create/update translations for each language
      for (const [language, text] of Object.entries(translationSet.translations)) {
        try {
          // Use upsert to create or update the translation
          await prisma.translation.upsert({
            where: {
              key_language: {
                key: translationSet.key,
                language: language
              }
            },
            create: {
              key: translationSet.key,
              language: language,
              text: text
            },
            update: {
              text: text
            }
          });
          console.log(`✅ Upserted ${translationSet.key} (${language}): "${text}"`);
        } catch (error) {
          console.error(`❌ Error upserting ${translationSet.key} (${language}):`, error);
        }
      }
    }

    console.log('🎉 Successfully processed all missing translations!');
  } catch (error) {
    console.error('❌ Error adding translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingEnglishTranslations();