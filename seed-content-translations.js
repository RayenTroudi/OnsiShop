// Seed content translations (hero, about, promotions, etc.)
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Content translation keys for static elements
const translations = [
  // Hero Section
  {
    key: 'hero_title',
    fr: 'Bienvenue dans notre magasin de vêtements',
    en: 'Welcome to Our Clothing Store',
    ar: 'مرحباً بكم في متجر الملابس الخاص بنا'
  },
  {
    key: 'hero_subtitle',
    fr: 'Découvrez les dernières tendances et styles de mode',
    en: 'Discover the latest fashion trends and styles',
    ar: 'اكتشف أحدث الاتجاهات والأنماط في الموضة'
  },
  {
    key: 'hero_description',
    fr: 'Achetez notre collection de vêtements de haute qualité pour hommes et femmes. Du casual au formel, nous avons tout ce dont vous avez besoin pour être à votre meilleur.',
    en: 'Shop our collection of high-quality clothing for men and women. From casual wear to formal attire, we have everything you need to look your best.',
    ar: 'تسوق مجموعتنا من الملابس عالية الجودة للرجال والنساء. من الملابس العادية إلى الرسمية، لدينا كل ما تحتاجه لتبدو في أفضل حالاتك.'
  },

  // Promotion Section
  {
    key: 'promotion_title',
    fr: 'Restez au chaud,\nRestez élégant',
    en: 'Stay Warm,\nStay Stylish',
    ar: 'ابق دافئاً،\nابق أنيقاً'
  },
  {
    key: 'promotion_subtitle',
    fr: 'Restez confortable et à la mode cet hiver avec notre collection hivernale !',
    en: 'Stay cozy and fashionable this winter with our winter collection!',
    ar: 'ابق مريحاً وعصرياً هذا الشتاء مع مجموعتنا الشتوية!'
  },
  {
    key: 'promotion_button_text',
    fr: 'Voir la collection',
    en: 'View Collection',
    ar: 'عرض المجموعة'
  },

  // About Section
  {
    key: 'about_title',
    fr: 'Mélange parfait de mode japonaise et occidentale',
    en: 'Perfect blend of Japanese and Western fashion',
    ar: 'مزج مثالي بين الموضة اليابانية والغربية'
  },
  {
    key: 'about_description',
    fr: 'Nous nous efforçons de créer des pièces à la fois uniques et intemporelles et sommes fiers d\'offrir des vêtements de haute qualité qui sont à la fois confortables et élégants.',
    en: 'We strive to create pieces that are both unique and timeless and take pride in offering high-quality clothing that is both comfortable and stylish.',
    ar: 'نسعى لإنشاء قطع فريدة وخالدة في آن واحد ونفتخر بتقديم ملابس عالية الجودة مريحة وأنيقة.'
  },
  {
    key: 'about_button_text',
    fr: 'À propos de nous',
    en: 'About Us',
    ar: 'معلومات عنا'
  },
  {
    key: 'section_about_us_title',
    fr: 'À propos de nous',
    en: 'About us',
    ar: 'معلومات عنا'
  },

  // Navigation (main menu items)
  {
    key: 'nav_best_sellers',
    fr: 'Meilleures ventes',
    en: 'Best Sellers',
    ar: 'الأكثر مبيعاً'
  },
  {
    key: 'nav_new_arrivals',
    fr: 'Nouveautés',
    en: 'New Arrivals',
    ar: 'وصل حديثاً'
  },
  {
    key: 'nav_clothing',
    fr: 'Vêtements',
    en: 'Clothing',
    ar: 'الملابس'
  },
  {
    key: 'nav_accessories',
    fr: 'Accessoires',
    en: 'Accessories',
    ar: 'الإكسسوارات'
  },

  // Footer
  {
    key: 'footer_navigation',
    fr: 'Navigation',
    en: 'Navigation',
    ar: 'التنقل'
  },
  {
    key: 'footer_follow_us',
    fr: 'Suivez-nous',
    en: 'Follow us',
    ar: 'تابعونا'
  },

  // Common sections
  {
    key: 'section_promotions',
    fr: 'Promotions',
    en: 'Promotions',
    ar: 'العروض الترويجية'
  },

  // Free shipping promotion
  {
    key: 'promo_free_shipping',
    fr: 'Livraison gratuite',
    en: 'Free shipping',
    ar: 'شحن مجاني'
  }
];

async function seedContentTranslations() {
  try {
    console.log('🌱 Seeding content translations...');

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

    console.log(`✅ Successfully seeded: ${translations.length} content translation keys`);
  } catch (error) {
    console.error('❌ Error seeding content translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedContentTranslations();
