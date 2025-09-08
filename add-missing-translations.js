const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const missingTranslations = [
  // Hero section
  {
    key: 'hero_alt_text',
    translations: {
      en: 'Winter collection banner',
      fr: 'Bannière collection hiver',
      ar: 'لافتة مجموعة الشتاء'
    }
  },
  {
    key: 'loading_video',
    translations: {
      en: 'Loading video...',
      fr: 'Chargement de la vidéo...',
      ar: '...جاري تحميل الفيديو'
    }
  },
  
  // Promo section
  {
    key: 'promo_title',
    translations: {
      en: 'Stay Warm,\nStay Stylish',
      fr: 'Restez au Chaud,\nRestez Élégant',
      ar: 'ابقوا دافئين\nابقوا أنيقين'
    }
  },
  {
    key: 'promo_subtitle',
    translations: {
      en: 'Stay cozy and fashionable this winter with our winter collection!',
      fr: 'Restez confortable et à la mode cet hiver avec notre collection hivernale !',
      ar: 'ابقوا مرتاحين وعصريين هذا الشتاء مع مجموعتنا الشتوية!'
    }
  },
  {
    key: 'promo_button',
    translations: {
      en: 'View Collection',
      fr: 'Voir la Collection',
      ar: 'عرض المجموعة'
    }
  },
  
  // About section
  {
    key: 'about_button',
    translations: {
      en: 'Learn More',
      fr: 'En Savoir Plus',
      ar: 'اعرف المزيد'
    }
  },
  
  // Navigation
  {
    key: 'nav_navigation',
    translations: {
      en: 'Navigation',
      fr: 'Navigation',
      ar: 'التنقل'
    }
  },
  {
    key: 'nav_follow_us',
    translations: {
      en: 'Follow us',
      fr: 'Suivez-nous',
      ar: 'تابعونا'
    }
  }
];

async function seedMissingTranslations() {
  try {
    console.log('🌱 Seeding missing translation keys...\n');

    let addedCount = 0;

    for (const item of missingTranslations) {
      console.log(`📝 Adding translations for "${item.key}":`);
      
      for (const [language, value] of Object.entries(item.translations)) {
        try {
          const translation = await prisma.translation.upsert({
            where: {
              key_language: {
                key: item.key,
                language: language
              }
            },
            update: {
              text: value
            },
            create: {
              key: item.key,
              language: language,
              text: value
            }
          });

          console.log(`  ✅ ${language}: "${value}"`);
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
    console.error('❌ Error seeding translations:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

seedMissingTranslations()
  .then(success => {
    if (success) {
      console.log('\n✅ Missing translation seeding complete!');
    } else {
      console.log('\n❌ Translation seeding failed.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
