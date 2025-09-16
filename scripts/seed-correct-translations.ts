import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const translations = [
  // Navigation
  { key: 'nav_home', en: 'Home', fr: 'Accueil', ar: 'الرئيسية' },
  { key: 'nav_shop', en: 'Shop', fr: 'Boutique', ar: 'المتجر' },
  { key: 'nav_about', en: 'About', fr: 'À propos', ar: 'حول' },
  { key: 'nav_contact', en: 'Contact', fr: 'Contact', ar: 'اتصل' },
  { key: 'nav_admin', en: 'Admin', fr: 'Admin', ar: 'الإدارة' },
  { key: 'nav_cart', en: 'Cart', fr: 'Panier', ar: 'السلة' },
  { key: 'nav_account', en: 'Account', fr: 'Compte', ar: 'الحساب' },
  { key: 'nav_login', en: 'Login', fr: 'Connexion', ar: 'تسجيل الدخول' },
  { key: 'nav_logout', en: 'Logout', fr: 'Déconnexion', ar: 'تسجيل الخروج' },
  { key: 'nav_orders', en: 'Orders', fr: 'Commandes', ar: 'الطلبات' },
  { key: 'nav_navigation', en: 'Navigation', fr: 'Navigation', ar: 'التنقل' },
  { key: 'nav_follow_us', en: 'Follow Us', fr: 'Suivez-Nous', ar: 'تابعنا' },

  // Menu items
  { key: 'menu_profile', en: 'Profile', fr: 'Profil', ar: 'الملف الشخصي' },
  { key: 'menu_admin', en: 'Admin', fr: 'Admin', ar: 'الإدارة' },

  // Hero section
  { key: 'hero_title', en: 'Welcome to OnsiShop', fr: 'Bienvenue chez OnsiShop', ar: 'مرحباً بكم في أونسي شوب' },
  { key: 'hero_subtitle', en: 'Discover Amazing Products', fr: 'Découvrez des Produits Incroyables', ar: 'اكتشف منتجات مذهلة' },
  { key: 'hero_description', en: 'Find the best products at unbeatable prices. Quality guaranteed with fast shipping worldwide.', fr: 'Trouvez les meilleurs produits à des prix imbattables. Qualité garantie avec expédition rapide dans le monde entier.', ar: 'ابحث عن أفضل المنتجات بأسعار لا تقبل المنافسة. جودة مضمونة مع شحن سريع في جميع أنحاء العالم.' },
  { key: 'hero_alt_text', en: 'Hero background image', fr: 'Image de fond héros', ar: 'صورة الخلفية الرئيسية' },
  { key: 'loading_video', en: 'Loading video...', fr: 'Chargement vidéo...', ar: 'جاري تحميل الفيديو...' },

  // Promotion section
  { key: 'promo_title', en: 'Special Offers', fr: 'Offres Spéciales', ar: 'عروض خاصة' },
  { key: 'promo_subtitle', en: 'Limited Time Deals', fr: 'Offres à Durée Limitée', ar: 'صفقات محدودة الوقت' },
  { key: 'promo_description', en: 'Don\'t miss out on our exclusive promotions and seasonal sales.', fr: 'Ne manquez pas nos promotions exclusives et nos ventes saisonnières.', ar: 'لا تفوت عروضنا الحصرية ومبيعاتنا الموسمية.' },
  { key: 'promo_free_shipping', en: 'Free shipping on orders over $50', fr: 'Livraison gratuite sur les commandes de plus de 50 $', ar: 'شحن مجاني على الطلبات التي تزيد عن 50 دولارًا' },

  // Product sections
  { key: 'section_new_arrivals', en: 'New Arrivals', fr: 'Nouveautés', ar: 'وصل حديثاً' },
  { key: 'section_best_sellers', en: 'Best Sellers', fr: 'Meilleures Ventes', ar: 'الأكثر مبيعاً' },
  { key: 'section_about_us_title', en: 'About Us', fr: 'À Propos', ar: 'معلومات عنا' },
  { key: 'button_view_more', en: 'View More', fr: 'Voir Plus', ar: 'عرض المزيد' },

  // About page
  { key: 'about_title', en: 'About OnsiShop', fr: 'À propos d\'OnsiShop', ar: 'حول أونسي شوب' },
  { key: 'about_subtitle', en: 'Your Trusted Shopping Partner', fr: 'Votre Partenaire de Confiance pour les Achats', ar: 'شريكك الموثوق في التسوق' },
  { key: 'about_description', en: 'We strive to provide the best shopping experience with quality products, competitive prices, and exceptional customer service.', fr: 'Nous nous efforçons de fournir la meilleure expérience d\'achat avec des produits de qualité, des prix compétitifs et un service client exceptionnel.', ar: 'نسعى لتوفير أفضل تجربة تسوق مع منتجات عالية الجودة وأسعار تنافسية وخدمة عملاء استثنائية.' },
  { key: 'about_button_text', en: 'Learn More', fr: 'En Savoir Plus', ar: 'اعرف المزيد' },

  // Contact page
  { key: 'contact_title', en: 'Contact Us', fr: 'Nous Contacter', ar: 'اتصل بنا' },
  { key: 'contact_subtitle', en: 'Get in Touch', fr: 'Entrez en Contact', ar: 'تواصل معنا' },
  { key: 'contact_description', en: 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.', fr: 'Vous avez des questions ? Nous aimerions avoir de vos nouvelles. Envoyez-nous un message et nous vous répondrons dès que possible.', ar: 'لديك أسئلة؟ نحن نحب أن نسمع منك. أرسل لنا رسالة وسنرد في أقرب وقت ممكن.' },
  { key: 'contact_form_name', en: 'Your Name', fr: 'Votre Nom', ar: 'اسمك' },
  { key: 'contact_form_email', en: 'Your Email', fr: 'Votre Email', ar: 'بريدك الإلكتروني' },
  { key: 'contact_form_subject', en: 'Subject', fr: 'Sujet', ar: 'الموضوع' },
  { key: 'contact_form_message', en: 'Your Message', fr: 'Votre Message', ar: 'رسالتك' },
  { key: 'contact_form_submit', en: 'Send Message', fr: 'Envoyer le Message', ar: 'إرسال الرسالة' },

  // Footer
  { key: 'footer_copyright', en: '© 2025 OnsiShop', fr: '© 2025 OnsiShop', ar: '© ٢٠٢٥ أونسي شوب' },
  { key: 'footer_all_rights_reserved', en: 'All rights reserved', fr: 'Tous droits réservés', ar: 'جميع الحقوق محفوظة' },
  { key: 'footer_disclaimer_title', en: 'Disclaimer', fr: 'Avertissement', ar: 'إخلاء المسؤولية' },
  { key: 'footer_disclaimer_text', en: 'This website is for demonstration purposes only. Products and prices may not be accurate.', fr: 'Ce site web est à des fins de démonstration uniquement. Les produits et les prix peuvent ne pas être exacts.', ar: 'هذا الموقع الإلكتروني لأغراض العرض فقط. قد لا تكون المنتجات والأسعار دقيقة.' },

  // Product related
  { key: 'product_add_to_cart_error', en: 'Failed to add product to cart', fr: 'Échec de l\'ajout du produit au panier', ar: 'فشل في إضافة المنتج إلى السلة' },
  { key: 'product_add_to_cart', en: 'Add to Cart', fr: 'Ajouter au Panier', ar: 'أضف إلى السلة' },
  { key: 'product_buy_now', en: 'Buy Now', fr: 'Acheter Maintenant', ar: 'اشتري الآن' },
  { key: 'product_out_of_stock', en: 'Out of Stock', fr: 'Rupture de Stock', ar: 'نفد من المخزون' },
  { key: 'product_price', en: 'Price', fr: 'Prix', ar: 'السعر' },
  { key: 'product_description', en: 'Description', fr: 'Description', ar: 'الوصف' },
  { key: 'product_specifications', en: 'Specifications', fr: 'Spécifications', ar: 'المواصفات' },
  { key: 'product_reviews', en: 'Reviews', fr: 'Avis', ar: 'التقييمات' },
  { key: 'product_related', en: 'Related Products', fr: 'Produits Connexes', ar: 'منتجات ذات صلة' },

  // Cart related
  { key: 'cart_title', en: 'Shopping Cart', fr: 'Panier d\'Achat', ar: 'سلة التسوق' },
  { key: 'cart_empty', en: 'Your cart is empty', fr: 'Votre panier est vide', ar: 'سلتك فارغة' },
  { key: 'cart_subtotal', en: 'Subtotal', fr: 'Sous-total', ar: 'المجموع الفرعي' },
  { key: 'cart_shipping', en: 'Shipping', fr: 'Livraison', ar: 'الشحن' },
  { key: 'cart_tax', en: 'Tax', fr: 'Taxe', ar: 'الضريبة' },
  { key: 'cart_total', en: 'Total', fr: 'Total', ar: 'المجموع' },
  { key: 'cart_checkout', en: 'Proceed to Checkout', fr: 'Procéder au Paiement', ar: 'المتابعة للدفع' },
  { key: 'cart_continue_shopping', en: 'Continue Shopping', fr: 'Continuer les Achats', ar: 'مواصلة التسوق' },

  // Common buttons and actions
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

  // Error messages
  { key: 'error_page_not_found', en: 'Page not found', fr: 'Page non trouvée', ar: 'الصفحة غير موجودة' },
  { key: 'error_something_wrong', en: 'Something went wrong', fr: 'Quelque chose s\'est mal passé', ar: 'حدث خطأ ما' },
  { key: 'error_try_again', en: 'Please try again', fr: 'Veuillez réessayer', ar: 'يرجى المحاولة مرة أخرى' },

  // Admin related
  { key: 'admin_dashboard', en: 'Dashboard', fr: 'Tableau de Bord', ar: 'لوحة التحكم' },
  { key: 'admin_products', en: 'Products', fr: 'Produits', ar: 'المنتجات' },
  { key: 'admin_orders', en: 'Orders', fr: 'Commandes', ar: 'الطلبات' },
  { key: 'admin_customers', en: 'Customers', fr: 'Clients', ar: 'العملاء' },
  { key: 'admin_settings', en: 'Settings', fr: 'Paramètres', ar: 'الإعدادات' },

  // Language names
  { key: 'language_english', en: 'English', fr: 'Anglais', ar: 'الإنجليزية' },
  { key: 'language_french', en: 'French', fr: 'Français', ar: 'الفرنسية' },
  { key: 'language_arabic', en: 'Arabic', fr: 'Arabe', ar: 'العربية' },
]

async function main() {
  console.log('🌱 Starting correct translation seeding...')
  console.log('🔗 Using DATABASE_URL:', process.env.DATABASE_URL?.includes('prisma+postgres') ? 'Prisma Accelerate' : 'Direct connection')

  try {
    // First, let's clear existing translations to avoid conflicts
    console.log('🧹 Clearing existing translations...')
    await prisma.translation.deleteMany({})
    console.log('✅ Existing translations cleared')

    // Process each translation key
    for (const translationGroup of translations) {
      const { key, en, fr, ar } = translationGroup

      // Insert English translation
      await prisma.translation.create({
        data: {
          key: key,
          language: 'en',
          text: en
        }
      })

      // Insert French translation
      await prisma.translation.create({
        data: {
          key: key,
          language: 'fr',
          text: fr
        }
      })

      // Insert Arabic translation
      await prisma.translation.create({
        data: {
          key: key,
          language: 'ar',
          text: ar
        }
      })

      console.log(`✅ Processed translation: ${key}`)
    }

    // Count final translations
    const totalTranslations = await prisma.translation.count()
    const englishCount = await prisma.translation.count({ where: { language: 'en' } })
    const frenchCount = await prisma.translation.count({ where: { language: 'fr' } })
    const arabicCount = await prisma.translation.count({ where: { language: 'ar' } })

    console.log('\n🎉 Correct translation seeding completed!')
    console.log(`📊 Total translations: ${totalTranslations}`)
    console.log(`🇺🇸 English: ${englishCount}`)
    console.log(`🇫🇷 French: ${frenchCount}`)
    console.log(`🇸🇦 Arabic: ${arabicCount}`)

    // Show sample translations for verification
    console.log('\n🔍 Sample translations:')
    const sampleKeys = ['hero_title', 'hero_description', 'nav_home', 'about_title']
    for (const sampleKey of sampleKeys) {
      const translations = await prisma.translation.findMany({
        where: { key: sampleKey },
        select: { language: true, text: true }
      })
      console.log(`📝 ${sampleKey}:`)
      translations.forEach(t => {
        console.log(`   ${t.language}: "${t.text}"`)
      })
    }

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