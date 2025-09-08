const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const navigationTranslations = [
  // Navigation menu items
  {
    key: 'nav_best_sellers',
    en: 'Best Sellers',
    fr: 'Meilleures Ventes',
    ar: 'الأكثر مبيعاً'
  },
  {
    key: 'nav_new_arrivals',
    en: 'New Arrivals',
    fr: 'Nouveautés',
    ar: 'وصل حديثاً'
  },
  {
    key: 'nav_clothing',
    en: 'Clothing',
    fr: 'Vêtements',
    ar: 'ملابس'
  },
  {
    key: 'nav_accessories',
    en: 'Accessories',
    fr: 'Accessoires',
    ar: 'إكسسوارات'
  }
];

async function addNavigationTranslations() {
  console.log('🚀 Adding navigation translation keys...');
  
  try {
    for (const translation of navigationTranslations) {
      const { key, en, fr, ar } = translation;
      
      // Create or update English translation
      await prisma.translation.upsert({
        where: { 
          key_language: { 
            key: key, 
            language: 'en' 
          } 
        },
        update: { text: en },
        create: {
          key: key,
          language: 'en',
          text: en
        }
      });
      
      // Create or update French translation
      await prisma.translation.upsert({
        where: { 
          key_language: { 
            key: key, 
            language: 'fr' 
          } 
        },
        update: { text: fr },
        create: {
          key: key,
          language: 'fr',
          text: fr
        }
      });
      
      // Create or update Arabic translation
      await prisma.translation.upsert({
        where: { 
          key_language: { 
            key: key, 
            language: 'ar' 
          } 
        },
        update: { text: ar },
        create: {
          key: key,
          language: 'ar',
          text: ar
        }
      });
      
      console.log(`✅ Added translations for key: ${key}`);
    }
    
    console.log('🎉 All navigation translations added successfully!');
    
    // Verify the keys were added
    const count = await prisma.translation.count({
      where: {
        key: {
          in: navigationTranslations.map(t => t.key)
        }
      }
    });
    
    console.log(`📊 Total navigation translation records: ${count}`);
    
  } catch (error) {
    console.error('❌ Error adding navigation translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addNavigationTranslations();
