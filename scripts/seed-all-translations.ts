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

  // Language switcher
  { key: 'language_english', en: 'English', fr: 'Anglais', ar: 'الإنجليزية' },
  { key: 'language_french', en: 'French', fr: 'Français', ar: 'الفرنسية' },
  { key: 'language_arabic', en: 'Arabic', fr: 'Arabe', ar: 'العربية' },

  // Hero section
  { key: 'hero_title', en: 'Welcome to OnsiShop', fr: 'Bienvenue chez OnsiShop', ar: 'مرحباً بكم في أونسي شوب' },
  { key: 'hero_subtitle', en: 'Discover Amazing Products', fr: 'Découvrez des Produits Incroyables', ar: 'اكتشف منتجات مذهلة' },
  { key: 'hero_description', en: 'Find the best products at unbeatable prices. Quality guaranteed with fast shipping worldwide.', fr: 'Trouvez les meilleurs produits à des prix imbattables. Qualité garantie avec expédition rapide dans le monde entier.', ar: 'ابحث عن أفضل المنتجات بأسعار لا تقبل المنافسة. جودة مضمونة مع شحن سريع في جميع أنحاء العالم.' },
  { key: 'hero_cta', en: 'Shop Now', fr: 'Acheter Maintenant', ar: 'تسوق الآن' },
  { key: 'hero_learn_more', en: 'Learn More', fr: 'En Savoir Plus', ar: 'اعرف المزيد' },

  // Promotion section
  { key: 'promo_title', en: 'Special Offers', fr: 'Offres Spéciales', ar: 'عروض خاصة' },
  { key: 'promo_subtitle', en: 'Limited Time Deals', fr: 'Offres à Durée Limitée', ar: 'صفقات محدودة الوقت' },
  { key: 'promo_description', en: 'Don\'t miss out on our exclusive promotions and seasonal sales.', fr: 'Ne manquez pas nos promotions exclusives et nos ventes saisonnières.', ar: 'لا تفوت عروضنا الحصرية ومبيعاتنا الموسمية.' },

  // Product categories
  { key: 'categories.title', en: 'Shop by Category', fr: 'Acheter par Catégorie', ar: 'تسوق حسب الفئة' },
  { key: 'categories.view_all', en: 'View All Categories', fr: 'Voir Toutes les Catégories', ar: 'عرض جميع الفئات' },

  // About page
  { key: 'about.title', en: 'About OnsiShop', fr: 'À propos d\'OnsiShop', ar: 'حول أونسي شوب' },
  { key: 'about.subtitle', en: 'Your Trusted Shopping Partner', fr: 'Votre Partenaire de Confiance pour les Achats', ar: 'شريكك الموثوق في التسوق' },
  { key: 'about.mission.title', en: 'Our Mission', fr: 'Notre Mission', ar: 'مهمتنا' },
  { key: 'about.mission.description', en: 'We strive to provide the best shopping experience with quality products, competitive prices, and exceptional customer service.', fr: 'Nous nous efforçons de fournir la meilleure expérience d\'achat avec des produits de qualité, des prix compétitifs et un service client exceptionnel.', ar: 'نسعى لتوفير أفضل تجربة تسوق مع منتجات عالية الجودة وأسعار تنافسية وخدمة عملاء استثنائية.' },
  { key: 'about.vision.title', en: 'Our Vision', fr: 'Notre Vision', ar: 'رؤيتنا' },
  { key: 'about.vision.description', en: 'To become the leading e-commerce platform that connects customers with amazing products from around the world.', fr: 'Devenir la principale plateforme de commerce électronique qui connecte les clients avec des produits incroyables du monde entier.', ar: 'أن نصبح منصة التجارة الإلكترونية الرائدة التي تربط العملاء بمنتجات رائعة من جميع أنحاء العالم.' },
  { key: 'about.values.title', en: 'Our Values', fr: 'Nos Valeurs', ar: 'قيمنا' },
  { key: 'about.values.quality', en: 'Quality First', fr: 'La Qualité d\'Abord', ar: 'الجودة أولاً' },
  { key: 'about.values.trust', en: 'Trust & Reliability', fr: 'Confiance et Fiabilité', ar: 'الثقة والموثوقية' },
  { key: 'about.values.innovation', en: 'Innovation', fr: 'Innovation', ar: 'الابتكار' },
  { key: 'about.values.service', en: 'Customer Service', fr: 'Service Client', ar: 'خدمة العملاء' },

  // Contact page
  { key: 'contact.title', en: 'Contact Us', fr: 'Nous Contacter', ar: 'اتصل بنا' },
  { key: 'contact.subtitle', en: 'Get in Touch', fr: 'Entrez en Contact', ar: 'تواصل معنا' },
  { key: 'contact.description', en: 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.', fr: 'Vous avez des questions ? Nous aimerions avoir de vos nouvelles. Envoyez-nous un message et nous vous répondrons dès que possible.', ar: 'لديك أسئلة؟ نحن نحب أن نسمع منك. أرسل لنا رسالة وسنرد في أقرب وقت ممكن.' },
  { key: 'contact.form.name', en: 'Your Name', fr: 'Votre Nom', ar: 'اسمك' },
  { key: 'contact.form.email', en: 'Your Email', fr: 'Votre Email', ar: 'بريدك الإلكتروني' },
  { key: 'contact.form.subject', en: 'Subject', fr: 'Sujet', ar: 'الموضوع' },
  { key: 'contact.form.message', en: 'Your Message', fr: 'Votre Message', ar: 'رسالتك' },
  { key: 'contact.form.submit', en: 'Send Message', fr: 'Envoyer le Message', ar: 'إرسال الرسالة' },
  { key: 'contact.info.address', en: 'Our Address', fr: 'Notre Adresse', ar: 'عنواننا' },
  { key: 'contact.info.phone', en: 'Phone Number', fr: 'Numéro de Téléphone', ar: 'رقم الهاتف' },
  { key: 'contact.info.email', en: 'Email Address', fr: 'Adresse Email', ar: 'عنوان البريد الإلكتروني' },
  { key: 'contact.info.hours', en: 'Business Hours', fr: 'Heures d\'Ouverture', ar: 'ساعات العمل' },

  // Footer
  { key: 'footer.company.title', en: 'Company', fr: 'Entreprise', ar: 'الشركة' },
  { key: 'footer.company.about', en: 'About Us', fr: 'À Propos', ar: 'معلومات عنا' },
  { key: 'footer.company.careers', en: 'Careers', fr: 'Carrières', ar: 'الوظائف' },
  { key: 'footer.company.press', en: 'Press', fr: 'Presse', ar: 'الصحافة' },
  { key: 'footer.company.blog', en: 'Blog', fr: 'Blog', ar: 'المدونة' },
  { key: 'footer.support.title', en: 'Support', fr: 'Support', ar: 'الدعم' },
  { key: 'footer.support.help', en: 'Help Center', fr: 'Centre d\'Aide', ar: 'مركز المساعدة' },
  { key: 'footer.support.contact', en: 'Contact Us', fr: 'Nous Contacter', ar: 'اتصل بنا' },
  { key: 'footer.support.shipping', en: 'Shipping Info', fr: 'Info Livraison', ar: 'معلومات الشحن' },
  { key: 'footer.support.returns', en: 'Returns', fr: 'Retours', ar: 'المرتجعات' },
  { key: 'footer.legal.title', en: 'Legal', fr: 'Légal', ar: 'قانوني' },
  { key: 'footer.legal.privacy', en: 'Privacy Policy', fr: 'Politique de Confidentialité', ar: 'سياسة الخصوصية' },
  { key: 'footer.legal.terms', en: 'Terms of Service', fr: 'Conditions d\'Utilisation', ar: 'شروط الخدمة' },
  { key: 'footer.legal.cookies', en: 'Cookie Policy', fr: 'Politique des Cookies', ar: 'سياسة ملفات تعريف الارتباط' },
  { key: 'footer.social.title', en: 'Follow Us', fr: 'Suivez-Nous', ar: 'تابعنا' },
  { key: 'footer.newsletter.title', en: 'Newsletter', fr: 'Newsletter', ar: 'النشرة الإخبارية' },
  { key: 'footer.newsletter.description', en: 'Subscribe to get updates on new products and offers', fr: 'Abonnez-vous pour recevoir des mises à jour sur les nouveaux produits et offres', ar: 'اشترك للحصول على تحديثات حول المنتجات والعروض الجديدة' },
  { key: 'footer.newsletter.placeholder', en: 'Enter your email', fr: 'Entrez votre email', ar: 'أدخل بريدك الإلكتروني' },
  { key: 'footer.newsletter.button', en: 'Subscribe', fr: 'S\'abonner', ar: 'اشترك' },
  { key: 'footer.copyright', en: '© 2025 OnsiShop. All rights reserved.', fr: '© 2025 OnsiShop. Tous droits réservés.', ar: '© ٢٠٢٥ أونسي شوب. جميع الحقوق محفوظة.' },

  // Product related
  { key: 'product.add_to_cart', en: 'Add to Cart', fr: 'Ajouter au Panier', ar: 'أضف إلى السلة' },
  { key: 'product.buy_now', en: 'Buy Now', fr: 'Acheter Maintenant', ar: 'اشتري الآن' },
  { key: 'product.out_of_stock', en: 'Out of Stock', fr: 'Rupture de Stock', ar: 'نفد من المخزون' },
  { key: 'product.price', en: 'Price', fr: 'Prix', ar: 'السعر' },
  { key: 'product.description', en: 'Description', fr: 'Description', ar: 'الوصف' },
  { key: 'product.specifications', en: 'Specifications', fr: 'Spécifications', ar: 'المواصفات' },
  { key: 'product.reviews', en: 'Reviews', fr: 'Avis', ar: 'التقييمات' },
  { key: 'product.related', en: 'Related Products', fr: 'Produits Connexes', ar: 'منتجات ذات صلة' },

  // Cart related
  { key: 'cart.title', en: 'Shopping Cart', fr: 'Panier d\'Achat', ar: 'سلة التسوق' },
  { key: 'cart.empty', en: 'Your cart is empty', fr: 'Votre panier est vide', ar: 'سلتك فارغة' },
  { key: 'cart.subtotal', en: 'Subtotal', fr: 'Sous-total', ar: 'المجموع الفرعي' },
  { key: 'cart.shipping', en: 'Shipping', fr: 'Livraison', ar: 'الشحن' },
  { key: 'cart.tax', en: 'Tax', fr: 'Taxe', ar: 'الضريبة' },
  { key: 'cart.total', en: 'Total', fr: 'Total', ar: 'المجموع' },
  { key: 'cart.checkout', en: 'Proceed to Checkout', fr: 'Procéder au Paiement', ar: 'المتابعة للدفع' },
  { key: 'cart.continue_shopping', en: 'Continue Shopping', fr: 'Continuer les Achats', ar: 'مواصلة التسوق' },

  // Common buttons and actions
  { key: 'common.save', en: 'Save', fr: 'Enregistrer', ar: 'حفظ' },
  { key: 'common.cancel', en: 'Cancel', fr: 'Annuler', ar: 'إلغاء' },
  { key: 'common.edit', en: 'Edit', fr: 'Modifier', ar: 'تعديل' },
  { key: 'common.delete', en: 'Delete', fr: 'Supprimer', ar: 'حذف' },
  { key: 'common.view', en: 'View', fr: 'Voir', ar: 'عرض' },
  { key: 'common.search', en: 'Search', fr: 'Rechercher', ar: 'بحث' },
  { key: 'common.loading', en: 'Loading...', fr: 'Chargement...', ar: 'جاري التحميل...' },
  { key: 'common.error', en: 'Error', fr: 'Erreur', ar: 'خطأ' },
  { key: 'common.success', en: 'Success', fr: 'Succès', ar: 'نجح' },
  { key: 'common.close', en: 'Close', fr: 'Fermer', ar: 'إغلاق' },
  { key: 'common.back', en: 'Back', fr: 'Retour', ar: 'عودة' },
  { key: 'common.next', en: 'Next', fr: 'Suivant', ar: 'التالي' },
  { key: 'common.previous', en: 'Previous', fr: 'Précédent', ar: 'السابق' },

  // Error messages
  { key: 'error.page_not_found', en: 'Page not found', fr: 'Page non trouvée', ar: 'الصفحة غير موجودة' },
  { key: 'error.something_wrong', en: 'Something went wrong', fr: 'Quelque chose s\'est mal passé', ar: 'حدث خطأ ما' },
  { key: 'error.try_again', en: 'Please try again', fr: 'Veuillez réessayer', ar: 'يرجى المحاولة مرة أخرى' },

  // Admin related
  { key: 'admin.dashboard', en: 'Dashboard', fr: 'Tableau de Bord', ar: 'لوحة التحكم' },
  { key: 'admin.products', en: 'Products', fr: 'Produits', ar: 'المنتجات' },
  { key: 'admin.orders', en: 'Orders', fr: 'Commandes', ar: 'الطلبات' },
  { key: 'admin.customers', en: 'Customers', fr: 'Clients', ar: 'العملاء' },
  { key: 'admin.settings', en: 'Settings', fr: 'Paramètres', ar: 'الإعدادات' },
]

async function main() {
  console.log('🌱 Starting translation seeding...')

  try {
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

      console.log(`✅ Processed translation: ${key}`)
    }

    // Count final translations
    const totalTranslations = await prisma.translation.count()
    const englishCount = await prisma.translation.count({ where: { language: 'en' } })
    const frenchCount = await prisma.translation.count({ where: { language: 'fr' } })
    const arabicCount = await prisma.translation.count({ where: { language: 'ar' } })

    console.log('\n🎉 Translation seeding completed!')
    console.log(`📊 Total translations: ${totalTranslations}`)
    console.log(`🇺🇸 English: ${englishCount}`)
    console.log(`🇫🇷 French: ${frenchCount}`)
    console.log(`🇸🇦 Arabic: ${arabicCount}`)

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