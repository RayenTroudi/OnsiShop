// Seed remaining translations (error page and common UI)
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Error and common UI translation keys
const translations = [
  // Error page
  {
    key: 'error_title',
    fr: 'Erreur !',
    en: 'Error!',
    ar: 'خطأ!'
  },
  {
    key: 'error_message',
    fr: 'Il y a eu un problème avec notre boutique. Cela pourrait être un problème temporaire, veuillez réessayer votre action.',
    en: 'There was an issue with our storefront. This could be a temporary issue, please try your action again.',
    ar: 'حدثت مشكلة في متجرنا. قد تكون هذه مشكلة مؤقتة، يرجى المحاولة مرة أخرى.'
  },
  {
    key: 'error_try_again',
    fr: 'Réessayer',
    en: 'Try Again',
    ar: 'المحاولة مرة أخرى'
  },

  // Navigation
  {
    key: 'nav_login',
    fr: 'Se connecter',
    en: 'Login',
    ar: 'تسجيل الدخول'
  },
  {
    key: 'nav_logout',
    fr: 'Se déconnecter',
    en: 'Logout',
    ar: 'تسجيل الخروج'
  },
  {
    key: 'nav_orders',
    fr: 'Mes commandes',
    en: 'My Orders',
    ar: 'طلباتي'
  },
  {
    key: 'menu_profile',
    fr: 'Profil',
    en: 'Profile',
    ar: 'الملف الشخصي'
  },
  {
    key: 'menu_admin',
    fr: 'Administration',
    en: 'Admin',
    ar: 'الإدارة'
  },

  // Loading states
  {
    key: 'loading_please_wait',
    fr: 'Veuillez patienter...',
    en: 'Please wait...',
    ar: 'يرجى الانتظار...'
  },

  // Empty states
  {
    key: 'no_items_found',
    fr: 'Aucun élément trouvé',
    en: 'No items found',
    ar: 'لم يتم العثور على عناصر'
  },

  // Actions
  {
    key: 'btn_save',
    fr: 'Sauvegarder',
    en: 'Save',
    ar: 'حفظ'
  },
  {
    key: 'btn_cancel',
    fr: 'Annuler',
    en: 'Cancel',
    ar: 'إلغاء'
  },
  {
    key: 'btn_delete',
    fr: 'Supprimer',
    en: 'Delete',
    ar: 'حذف'
  },
  {
    key: 'btn_edit',
    fr: 'Modifier',
    en: 'Edit',
    ar: 'تعديل'
  },
  {
    key: 'btn_view',
    fr: 'Voir',
    en: 'View',
    ar: 'عرض'
  },

  // Confirmations
  {
    key: 'confirm_delete',
    fr: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
    en: 'Are you sure you want to delete this item?',
    ar: 'هل أنت متأكد من أنك تريد حذف هذا العنصر؟'
  },
  {
    key: 'confirm_yes',
    fr: 'Oui',
    en: 'Yes',
    ar: 'نعم'
  },
  {
    key: 'confirm_no',
    fr: 'Non',
    en: 'No',
    ar: 'لا'
  }
];

async function seedTranslations() {
  try {
    console.log('🌱 Seeding remaining translations...');

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

    console.log(`✅ Successfully seeded: ${translations.length} remaining translation keys`);
  } catch (error) {
    console.error('❌ Error seeding translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedTranslations();
