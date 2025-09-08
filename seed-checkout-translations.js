// Seed checkout translations
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Checkout translation keys
const translations = [
  {
    key: 'checkout_auth_required',
    fr: 'Authentification requise',
    en: 'Authentication Required',
    ar: 'المصادقة مطلوبة'
  },
  {
    key: 'checkout_login_prompt',
    fr: 'Veuillez vous connecter pour continuer votre commande.',
    en: 'Please log in to continue with your checkout.',
    ar: 'يرجى تسجيل الدخول لمتابعة عملية الدفع.'
  },
  {
    key: 'checkout_go_to_login',
    fr: 'Aller à la connexion',
    en: 'Go to Login',
    ar: 'الذهاب لتسجيل الدخول'
  },
  {
    key: 'checkout_full_name_required',
    fr: 'Le nom complet est requis',
    en: 'Full name is required',
    ar: 'الاسم الكامل مطلوب'
  },
  {
    key: 'checkout_email_required',
    fr: 'L\'email est requis',
    en: 'Email is required',
    ar: 'البريد الإلكتروني مطلوب'
  },
  {
    key: 'checkout_email_invalid',
    fr: 'Veuillez saisir une adresse email valide',
    en: 'Please enter a valid email address',
    ar: 'يرجى إدخال عنوان بريد إلكتروني صحيح'
  },
  {
    key: 'checkout_phone_required',
    fr: 'Le numéro de téléphone est requis',
    en: 'Phone number is required',
    ar: 'رقم الهاتف مطلوب'
  },
  {
    key: 'checkout_address_required',
    fr: 'L\'adresse de livraison est requise',
    en: 'Shipping address is required',
    ar: 'عنوان الشحن مطلوب'
  }
];

async function seedTranslations() {
  try {
    console.log('🌱 Seeding checkout translations...');

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

    console.log(`✅ Successfully seeded: ${translations.length} checkout translation keys`);
  } catch (error) {
    console.error('❌ Error seeding translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedTranslations();
