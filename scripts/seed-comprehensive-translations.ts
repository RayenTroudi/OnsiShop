import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const translations = [
  // Navigation (already exists in dots, adding underscores for compatibility)
  { key: 'nav_home', en: 'Home', fr: 'Accueil', ar: 'الرئيسية' },
  { key: 'nav_shop', en: 'Shop', fr: 'Boutique', ar: 'المتجر' },
  { key: 'nav_about', en: 'About', fr: 'À propos', ar: 'حول' },
  { key: 'nav_contact', en: 'Contact', fr: 'Contact', ar: 'اتصل' },
  { key: 'nav_admin', en: 'Admin', fr: 'Admin', ar: 'الإدارة' },
  { key: 'nav_cart', en: 'Cart', fr: 'Panier', ar: 'السلة' },
  { key: 'nav_account', en: 'Account', fr: 'Compte', ar: 'الحساب' },

  // Language switcher
  { key: 'language_english', en: 'English', fr: 'Anglais', ar: 'الإنجليزية' },
  { key: 'language_french', en: 'French', fr: 'Français', ar: 'الفرنسية' },
  { key: 'language_arabic', en: 'Arabic', fr: 'Arabe', ar: 'العربية' },

  // Hero section (underscore versions)
  { key: 'hero_title', en: 'Welcome to OnsiShop', fr: 'Bienvenue chez OnsiShop', ar: 'مرحباً بكم في أونسي شوب' },
  { key: 'hero_subtitle', en: 'Discover Amazing Products', fr: 'Découvrez des Produits Incroyables', ar: 'اكتشف منتجات مذهلة' },
  { key: 'hero_description', en: 'Find the best products at unbeatable prices. Quality guaranteed with fast shipping worldwide.', fr: 'Trouvez les meilleurs produits à des prix imbattables. Qualité garantie avec expédition rapide dans le monde entier.', ar: 'ابحث عن أفضل المنتجات بأسعار لا تقبل المنافسة. جودة مضمونة مع شحن سريع في جميع أنحاء العالم.' },
  { key: 'hero_cta', en: 'Shop Now', fr: 'Acheter Maintenant', ar: 'تسوق الآن' },
  { key: 'hero_learn_more', en: 'Learn More', fr: 'En Savoir Plus', ar: 'اعرف المزيد' },

  // Promotion section (underscore versions)
  { key: 'promo_title', en: 'Special Offers', fr: 'Offres Spéciales', ar: 'عروض خاصة' },
  { key: 'promo_subtitle', en: 'Limited Time Deals', fr: 'Offres à Durée Limitée', ar: 'صفقات محدودة الوقت' },
  { key: 'promo_description', en: 'Don\'t miss out on our exclusive promotions and seasonal sales.', fr: 'Ne manquez pas nos promotions exclusives et nos ventes saisonnières.', ar: 'لا تفوت عروضنا الحصرية ومبيعاتنا الموسمية.' },

  // About section (underscore versions)
  { key: 'about_title', en: 'About OnsiShop', fr: 'À propos d\'OnsiShop', ar: 'حول أونسي شوب' },
  { key: 'about_subtitle', en: 'Your Trusted Shopping Partner', fr: 'Votre Partenaire de Confiance pour les Achats', ar: 'شريكك الموثوق في التسوق' },
  { key: 'about_description', en: 'We strive to provide the best shopping experience with quality products, competitive prices, and exceptional customer service.', fr: 'Nous nous efforçons de fournir la meilleure expérience d\'achat avec des produits de qualité, des prix compétitifs et un service client exceptionnel.', ar: 'نسعى لتوفير أفضل تجربة تسوق مع منتجات عالية الجودة وأسعار تنافسية وخدمة عملاء استثنائية.' },
  { key: 'about_button_text', en: 'Learn More', fr: 'En Savoir Plus', ar: 'اعرف المزيد' },

  // AUTH TRANSLATIONS (MISSING - This is the main issue!)
  { key: 'auth_sign_in', en: 'Sign In', fr: 'Se Connecter', ar: 'تسجيل الدخول' },
  { key: 'auth_sign_up', en: 'Sign Up', fr: 'S\'inscrire', ar: 'إنشاء حساب' },
  { key: 'auth_create_new_account', en: 'Create a new account', fr: 'Créer un nouveau compte', ar: 'إنشاء حساب جديد' },
  { key: 'auth_continue_checkout', en: 'Please sign in to continue with checkout', fr: 'Veuillez vous connecter pour continuer avec le paiement', ar: 'يرجى تسجيل الدخول لمتابعة عملية الدفع' },
  { key: 'common_or', en: 'or', fr: 'ou', ar: 'أو' },
  { key: 'auth_demo_credentials', en: 'Demo Credentials', fr: 'Identifiants de Démonstration', ar: 'بيانات الاعتماد التجريبية' },
  { key: 'auth_admin', en: 'Admin', fr: 'Administrateur', ar: 'مدير' },
  { key: 'auth_user', en: 'User', fr: 'Utilisateur', ar: 'مستخدم' },
  { key: 'auth_email_address', en: 'Email address', fr: 'Adresse email', ar: 'عنوان البريد الإلكتروني' },
  { key: 'auth_password', en: 'Password', fr: 'Mot de passe', ar: 'كلمة المرور' },
  { key: 'auth_confirm_password', en: 'Confirm Password', fr: 'Confirmer le mot de passe', ar: 'تأكيد كلمة المرور' },
  { key: 'auth_full_name', en: 'Full Name', fr: 'Nom complet', ar: 'الاسم الكامل' },
  { key: 'auth_signing_in', en: 'Signing in...', fr: 'Connexion...', ar: 'جاري تسجيل الدخول...' },
  { key: 'auth_creating_account', en: 'Creating account...', fr: 'Création du compte...', ar: 'جاري إنشاء الحساب...' },
  { key: 'auth_back_to_store', en: 'Back to store', fr: 'Retour au magasin', ar: 'العودة إلى المتجر' },
  { key: 'auth_network_error', en: 'Network error. Please try again.', fr: 'Erreur réseau. Veuillez réessayer.', ar: 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.' },
  { key: 'auth_password_mismatch', en: 'Passwords do not match', fr: 'Les mots de passe ne correspondent pas', ar: 'كلمات المرور غير متطابقة' },
  { key: 'auth_already_have_account', en: 'Already have an account?', fr: 'Vous avez déjà un compte?', ar: 'هل لديك حساب بالفعل؟' },

  // Common buttons and actions (underscore versions)
  { key: 'common_save', en: 'Save', fr: 'Enregistrer', ar: 'حفظ' },
  { key: 'common_cancel', en: 'Cancel', fr: 'Annuler', ar: 'إلغاء' },
  { key: 'common_edit', en: 'Edit', fr: 'Modifier', ar: 'تعديل' },
  { key: 'common_delete', en: 'Delete', fr: 'Supprimer', ar: 'حذف' },
  { key: 'common_view', en: 'View', fr: 'Voir', ar: 'عرض' },
  { key: 'common_search', en: 'Search', fr: 'Rechercher', ar: 'بحث' },
  { key: 'common_loading', en: 'Loading...', fr: 'Chargement...', ar: 'جاري التحميل...' },
  { key: 'common_error', en: 'Error', fr: 'Erreur', ar: 'خطأ' },
  { key: 'common_success', en: 'Success', fr: 'Succès', ar: 'نجح' },
  { key: 'common_close', en: 'Close', fr: 'Fermer', ar: 'إغلاق' },
  { key: 'common_back', en: 'Back', fr: 'Retour', ar: 'عودة' },
  { key: 'common_next', en: 'Next', fr: 'Suivant', ar: 'التالي' },
  { key: 'common_previous', en: 'Previous', fr: 'Précédent', ar: 'السابق' },

  // Footer (underscore versions)
  { key: 'footer_company_title', en: 'Company', fr: 'Entreprise', ar: 'الشركة' },
  { key: 'footer_company_about', en: 'About Us', fr: 'À Propos', ar: 'معلومات عنا' },
  { key: 'footer_company_careers', en: 'Careers', fr: 'Carrières', ar: 'الوظائف' },
  { key: 'footer_company_press', en: 'Press', fr: 'Presse', ar: 'الصحافة' },
  { key: 'footer_company_blog', en: 'Blog', fr: 'Blog', ar: 'المدونة' },
  { key: 'footer_support_title', en: 'Support', fr: 'Support', ar: 'الدعم' },
  { key: 'footer_support_help', en: 'Help Center', fr: 'Centre d\'Aide', ar: 'مركز المساعدة' },
  { key: 'footer_support_contact', en: 'Contact Us', fr: 'Nous Contacter', ar: 'اتصل بنا' },
  { key: 'footer_support_shipping', en: 'Shipping Info', fr: 'Info Livraison', ar: 'معلومات الشحن' },
  { key: 'footer_support_returns', en: 'Returns', fr: 'Retours', ar: 'المرتجعات' },
  { key: 'footer_legal_title', en: 'Legal', fr: 'Légal', ar: 'قانوني' },
  { key: 'footer_legal_privacy', en: 'Privacy Policy', fr: 'Politique de Confidentialité', ar: 'سياسة الخصوصية' },
  { key: 'footer_legal_terms', en: 'Terms of Service', fr: 'Conditions d\'Utilisation', ar: 'شروط الخدمة' },
  { key: 'footer_legal_cookies', en: 'Cookie Policy', fr: 'Politique des Cookies', ar: 'سياسة ملفات تعريف الارتباط' },
  { key: 'footer_social_title', en: 'Follow Us', fr: 'Suivez-Nous', ar: 'تابعنا' },
  { key: 'footer_newsletter_title', en: 'Newsletter', fr: 'Newsletter', ar: 'النشرة الإخبارية' },
  { key: 'footer_newsletter_description', en: 'Subscribe to get updates on new products and offers', fr: 'Abonnez-vous pour recevoir des mises à jour sur les nouveaux produits et offres', ar: 'اشترك للحصول على تحديثات حول المنتجات والعروض الجديدة' },
  { key: 'footer_newsletter_placeholder', en: 'Enter your email', fr: 'Entrez votre email', ar: 'أدخل بريدك الإلكتروني' },
  { key: 'footer_newsletter_button', en: 'Subscribe', fr: 'S\'abonner', ar: 'اشترك' },
  { key: 'footer_copyright', en: '© 2025 OnsiShop. All rights reserved.', fr: '© 2025 OnsiShop. Tous droits réservés.', ar: '© ٢٠٢٥ أونسي شوب. جميع الحقوق محفوظة.' },

  // Product related (underscore versions)
  { key: 'product_add_to_cart', en: 'Add to Cart', fr: 'Ajouter au Panier', ar: 'أضف إلى السلة' },
  { key: 'product_buy_now', en: 'Buy Now', fr: 'Acheter Maintenant', ar: 'اشتري الآن' },
  { key: 'product_out_of_stock', en: 'Out of Stock', fr: 'Rupture de Stock', ar: 'نفد من المخزون' },
  { key: 'product_price', en: 'Price', fr: 'Prix', ar: 'السعر' },
  { key: 'product_description', en: 'Description', fr: 'Description', ar: 'الوصف' },
  { key: 'product_specifications', en: 'Specifications', fr: 'Spécifications', ar: 'المواصفات' },
  { key: 'product_reviews', en: 'Reviews', fr: 'Avis', ar: 'التقييمات' },
  { key: 'product_related', en: 'Related Products', fr: 'Produits Connexes', ar: 'منتجات ذات صلة' },

  // Cart related (underscore versions)
  { key: 'cart_title', en: 'Shopping Cart', fr: 'Panier d\'Achat', ar: 'سلة التسوق' },
  { key: 'cart_empty', en: 'Your cart is empty', fr: 'Votre panier est vide', ar: 'سلتك فارغة' },
  { key: 'cart_subtotal', en: 'Subtotal', fr: 'Sous-total', ar: 'المجموع الفرعي' },
  { key: 'cart_shipping', en: 'Shipping', fr: 'Livraison', ar: 'الشحن' },
  { key: 'cart_tax', en: 'Tax', fr: 'Taxe', ar: 'الضريبة' },
  { key: 'cart_total', en: 'Total', fr: 'Total', ar: 'المجموع' },
  { key: 'cart_checkout', en: 'Proceed to Checkout', fr: 'Procéder au Paiement', ar: 'المتابعة للدفع' },
  { key: 'cart_continue_shopping', en: 'Continue Shopping', fr: 'Continuer les Achats', ar: 'مواصلة التسوق' },

  // Error messages (underscore versions)
  { key: 'error_page_not_found', en: 'Page not found', fr: 'Page non trouvée', ar: 'الصفحة غير موجودة' },
  { key: 'error_something_wrong', en: 'Something went wrong', fr: 'Quelque chose s\'est mal passé', ar: 'حدث خطأ ما' },
  { key: 'error_try_again', en: 'Please try again', fr: 'Veuillez réessayer', ar: 'يرجى المحاولة مرة أخرى' },

  // Admin related (underscore versions)
  { key: 'admin_dashboard', en: 'Dashboard', fr: 'Tableau de Bord', ar: 'لوحة التحكم' },
  { key: 'admin_products', en: 'Products', fr: 'Produits', ar: 'المنتجات' },
  { key: 'admin_orders', en: 'Orders', fr: 'Commandes', ar: 'الطلبات' },
  { key: 'admin_customers', en: 'Customers', fr: 'Clients', ar: 'العملاء' },
  { key: 'admin_settings', en: 'Settings', fr: 'Paramètres', ar: 'الإعدادات' },

  // Contact page (underscore versions)
  { key: 'contact_title', en: 'Contact Us', fr: 'Nous Contacter', ar: 'اتصل بنا' },
  { key: 'contact_subtitle', en: 'Get in Touch', fr: 'Entrez en Contact', ar: 'تواصل معنا' },
  { key: 'contact_description', en: 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.', fr: 'Vous avez des questions ? Nous aimerions avoir de vos nouvelles. Envoyez-nous un message et nous vous répondrons dès que possible.', ar: 'لديك أسئلة؟ نحن نحب أن نسمع منك. أرسل لنا رسالة وسنرد في أقرب وقت ممكن.' },
  { key: 'contact_form_name', en: 'Your Name', fr: 'Votre Nom', ar: 'اسمك' },
  { key: 'contact_form_email', en: 'Your Email', fr: 'Votre Email', ar: 'بريدك الإلكتروني' },
  { key: 'contact_form_subject', en: 'Subject', fr: 'Sujet', ar: 'الموضوع' },
  { key: 'contact_form_message', en: 'Your Message', fr: 'Votre Message', ar: 'رسالتك' },
  { key: 'contact_form_submit', en: 'Send Message', fr: 'Envoyer le Message', ar: 'إرسال الرسالة' },
  { key: 'contact_info_address', en: 'Our Address', fr: 'Notre Adresse', ar: 'عنواننا' },
  { key: 'contact_info_phone', en: 'Phone Number', fr: 'Numéro de Téléphone', ar: 'رقم الهاتف' },
  { key: 'contact_info_email', en: 'Email Address', fr: 'Adresse Email', ar: 'عنوان البريد الإلكتروني' },
  { key: 'contact_info_hours', en: 'Business Hours', fr: 'Heures d\'Ouverture', ar: 'ساعات العمل' },

  // Categories
  { key: 'categories_title', en: 'Shop by Category', fr: 'Acheter par Catégorie', ar: 'تسوق حسب الفئة' },
  { key: 'categories_view_all', en: 'View All Categories', fr: 'Voir Toutes les Catégories', ar: 'عرض جميع الفئات' },

  // New Arrivals
  { key: 'new_arrivals_title', en: 'New Arrivals', fr: 'Nouveautés', ar: 'وصل حديثاً' },
  { key: 'new_arrivals_subtitle', en: 'Check out our latest products', fr: 'Découvrez nos derniers produits', ar: 'تحقق من منتجاتنا الأحدث' },

  // Menu items
  { key: 'menu_all_products', en: 'All Products', fr: 'Tous les Produits', ar: 'جميع المنتجات' },
  { key: 'menu_new_arrivals', en: 'New Arrivals', fr: 'Nouveautés', ar: 'وصل حديثاً' },
  { key: 'menu_bestsellers', en: 'Best Sellers', fr: 'Meilleures Ventes', ar: 'الأكثر مبيعاً' },
  { key: 'menu_sale', en: 'Sale', fr: 'Soldes', ar: 'تخفيضات' },
]

async function main() {
  console.log('🌱 Starting comprehensive translation seeding...')

  try {
    let processedCount = 0;
    
    // Process each translation key
    for (const translationGroup of translations) {
      const { key, en, fr, ar } = translationGroup

      // Insert English translation
      await prisma.translation.upsert({
        where: {
          key_language: {
            key: key,
            language: 'en'
          }
        },
        update: {
          text: en
        },
        create: {
          key: key,
          language: 'en',
          text: en
        }
      })

      // Insert French translation
      await prisma.translation.upsert({
        where: {
          key_language: {
            key: key,
            language: 'fr'
          }
        },
        update: {
          text: fr
        },
        create: {
          key: key,
          language: 'fr',
          text: fr
        }
      })

      // Insert Arabic translation
      await prisma.translation.upsert({
        where: {
          key_language: {
            key: key,
            language: 'ar'
          }
        },
        update: {
          text: ar
        },
        create: {
          key: key,
          language: 'ar',
          text: ar
        }
      })

      processedCount++
      if (processedCount % 10 === 0) {
        console.log(`✅ Processed ${processedCount} translation keys...`)
      }
    }

    // Count final translations
    const totalTranslations = await prisma.translation.count()
    const englishCount = await prisma.translation.count({ where: { language: 'en' } })
    const frenchCount = await prisma.translation.count({ where: { language: 'fr' } })
    const arabicCount = await prisma.translation.count({ where: { language: 'ar' } })

    console.log('\n🎉 Comprehensive translation seeding completed!')
    console.log(`📊 Total translations: ${totalTranslations}`)
    console.log(`🇺🇸 English: ${englishCount}`)
    console.log(`🇫🇷 French: ${frenchCount}`)
    console.log(`🇸🇦 Arabic: ${arabicCount}`)
    console.log(`🔄 Processed ${processedCount} translation groups`)

  } catch (error) {
    console.error('❌ Error seeding translations:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })