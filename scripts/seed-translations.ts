import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleTranslations = [
  // Navigation
  { key: 'nav_home', fr: 'Accueil', en: 'Home', ar: 'الرئيسية' },
  { key: 'nav_products', fr: 'Produits', en: 'Products', ar: 'المنتجات' },
  { key: 'nav_categories', fr: 'Catégories', en: 'Categories', ar: 'الفئات' },
  { key: 'nav_cart', fr: 'Panier', en: 'Cart', ar: 'السلة' },
  { key: 'nav_account', fr: 'Compte', en: 'Account', ar: 'الحساب' },
  { key: 'nav_login', fr: 'Connexion', en: 'Login', ar: 'تسجيل الدخول' },
  { key: 'nav_register', fr: 'Inscription', en: 'Register', ar: 'التسجيل' },
  { key: 'nav_logout', fr: 'Déconnexion', en: 'Logout', ar: 'تسجيل الخروج' },

  // Common
  { key: 'common_search', fr: 'Rechercher', en: 'Search', ar: 'بحث' },
  { key: 'common_save', fr: 'Enregistrer', en: 'Save', ar: 'حفظ' },
  { key: 'common_cancel', fr: 'Annuler', en: 'Cancel', ar: 'إلغاء' },
  { key: 'common_delete', fr: 'Supprimer', en: 'Delete', ar: 'حذف' },
  { key: 'common_edit', fr: 'Modifier', en: 'Edit', ar: 'تعديل' },
  { key: 'common_add', fr: 'Ajouter', en: 'Add', ar: 'إضافة' },
  { key: 'common_loading', fr: 'Chargement...', en: 'Loading...', ar: 'جاري التحميل...' },
  { key: 'common_error', fr: 'Erreur', en: 'Error', ar: 'خطأ' },
  { key: 'common_success', fr: 'Succès', en: 'Success', ar: 'نجح' },

  // Product
  { key: 'product_price', fr: 'Prix', en: 'Price', ar: 'السعر' },
  { key: 'product_description', fr: 'Description', en: 'Description', ar: 'الوصف' },
  { key: 'product_availability', fr: 'Disponibilité', en: 'Availability', ar: 'التوفر' },
  { key: 'product_in_stock', fr: 'En stock', en: 'In stock', ar: 'متوفر' },
  { key: 'product_out_of_stock', fr: 'Rupture de stock', en: 'Out of stock', ar: 'غير متوفر' },
  { key: 'product_add_to_cart', fr: 'Ajouter au panier', en: 'Add to cart', ar: 'أضف إلى السلة' },
  { key: 'product_quantity', fr: 'Quantité', en: 'Quantity', ar: 'الكمية' },

  // Cart
  { key: 'cart_title', fr: 'Votre panier', en: 'Your cart', ar: 'سلتك' },
  { key: 'cart_empty', fr: 'Votre panier est vide', en: 'Your cart is empty', ar: 'سلتك فارغة' },
  { key: 'cart_total', fr: 'Total', en: 'Total', ar: 'المجموع' },
  { key: 'cart_checkout', fr: 'Finaliser la commande', en: 'Checkout', ar: 'إتمام الطلب' },
  { key: 'cart_remove_item', fr: 'Supprimer l\'article', en: 'Remove item', ar: 'إزالة العنصر' },
  { key: 'cart_update_quantity', fr: 'Mettre à jour la quantité', en: 'Update quantity', ar: 'تحديث الكمية' },

  // Forms
  { key: 'form_email', fr: 'Adresse e-mail', en: 'Email address', ar: 'عنوان البريد الإلكتروني' },
  { key: 'form_password', fr: 'Mot de passe', en: 'Password', ar: 'كلمة المرور' },
  { key: 'form_confirm_password', fr: 'Confirmer le mot de passe', en: 'Confirm password', ar: 'تأكيد كلمة المرور' },
  { key: 'form_first_name', fr: 'Prénom', en: 'First name', ar: 'الاسم الأول' },
  { key: 'form_last_name', fr: 'Nom de famille', en: 'Last name', ar: 'الاسم الأخير' },
  { key: 'form_phone', fr: 'Téléphone', en: 'Phone', ar: 'الهاتف' },
  { key: 'form_address', fr: 'Adresse', en: 'Address', ar: 'العنوان' },

  // Messages
  { key: 'msg_welcome', fr: 'Bienvenue dans notre boutique!', en: 'Welcome to our shop!', ar: 'مرحباً بكم في متجرنا!' },
  { key: 'msg_login_success', fr: 'Connexion réussie', en: 'Login successful', ar: 'تم تسجيل الدخول بنجاح' },
  { key: 'msg_logout_success', fr: 'Déconnexion réussie', en: 'Logout successful', ar: 'تم تسجيل الخروج بنجاح' },
  { key: 'msg_item_added_to_cart', fr: 'Article ajouté au panier', en: 'Item added to cart', ar: 'تم إضافة العنصر إلى السلة' },
  { key: 'msg_order_placed', fr: 'Commande passée avec succès', en: 'Order placed successfully', ar: 'تم تقديم الطلب بنجاح' },

  // Footer
  { key: 'footer_about', fr: 'À propos', en: 'About', ar: 'حول' },
  { key: 'footer_contact', fr: 'Contact', en: 'Contact', ar: 'اتصل بنا' },
  { key: 'footer_privacy', fr: 'Confidentialité', en: 'Privacy', ar: 'الخصوصية' },
  { key: 'footer_terms', fr: 'Conditions d\'utilisation', en: 'Terms of service', ar: 'شروط الخدمة' },
  { key: 'footer_follow_us', fr: 'Suivez-nous', en: 'Follow us', ar: 'تابعونا' },
];

async function seedTranslations() {
  console.log('🌱 Starting translation seeding...');

  try {
    for (const translation of sampleTranslations) {
      // Create French translation
      await (prisma as any).translation.upsert({
        where: {
          key_language: {
            key: translation.key,
            language: 'fr',
          },
        },
        update: {
          text: translation.fr,
        },
        create: {
          key: translation.key,
          language: 'fr',
          text: translation.fr,
        },
      });

      // Create English translation
      await (prisma as any).translation.upsert({
        where: {
          key_language: {
            key: translation.key,
            language: 'en',
          },
        },
        update: {
          text: translation.en,
        },
        create: {
          key: translation.key,
          language: 'en',
          text: translation.en,
        },
      });

      // Create Arabic translation
      await (prisma as any).translation.upsert({
        where: {
          key_language: {
            key: translation.key,
            language: 'ar',
          },
        },
        update: {
          text: translation.ar,
        },
        create: {
          key: translation.key,
          language: 'ar',
          text: translation.ar,
        },
      });
    }

    console.log(`✅ Successfully seeded ${sampleTranslations.length} translation keys in 3 languages`);
    console.log(`📊 Total translations created: ${sampleTranslations.length * 3}`);
  } catch (error) {
    console.error('❌ Error seeding translations:', error);
    throw error;
  }
}

if (require.main === module) {
  seedTranslations()
    .then(() => {
      console.log('🎉 Translation seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Translation seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default seedTranslations;
