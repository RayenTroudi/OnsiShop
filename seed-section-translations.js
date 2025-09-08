const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sectionTranslations = [
  // Section headings
  { key: 'section_best_sellers', fr: 'Meilleures Ventes', en: 'Best Sellers', ar: 'الأكثر مبيعاً' },
  { key: 'section_new_arrivals', fr: 'Nouveautés', en: 'New Arrivals', ar: 'وصل حديثاً' },
  { key: 'section_about_us', fr: 'À Propos de Nous', en: 'About Us', ar: 'معلومات عنا' },
  { key: 'section_promotions', fr: 'Promotions', en: 'Promotions', ar: 'العروض الترويجية' },
  
  // Promo/Marketing
  { key: 'promo_free_shipping', fr: 'LIVRAISON GRATUITE sur toutes les commandes supérieures à ¥20000', en: 'FREE SHIPPING on all orders above ¥20000', ar: 'شحن مجاني على جميع الطلبات فوق ¥20000' },
  { key: 'button_view_more', fr: 'Voir Plus', en: 'View More', ar: 'عرض المزيد' },
  { key: 'button_view_collection', fr: 'Voir la Collection', en: 'View Collection', ar: 'عرض المجموعة' },
  
  // User interface
  { key: 'menu_search', fr: 'Recherche', en: 'Search', ar: 'بحث' },
  { key: 'menu_profile', fr: 'Profil', en: 'Profile', ar: 'الملف الشخصي' },
  { key: 'menu_admin', fr: 'Administration', en: 'Admin', ar: 'الإدارة' },
  { key: 'menu_logout', fr: 'Se Déconnecter', en: 'Logout', ar: 'تسجيل خروج' },
  
  // Categories (common ones)
  { key: 'category_all', fr: 'Tous', en: 'All', ar: 'الكل' },
  { key: 'category_clothing', fr: 'Vêtements', en: 'Clothing', ar: 'ملابس' },
  { key: 'category_bags', fr: 'Sacs', en: 'Bags', ar: 'حقائب' },
  { key: 'category_shoes', fr: 'Chaussures', en: 'Shoes', ar: 'أحذية' },
  { key: 'category_accessories', fr: 'Accessoires', en: 'Accessories', ar: 'إكسسوارات' },
  
  // Filter/Sort
  { key: 'filter_sort_by', fr: 'Trier par', en: 'Sort by', ar: 'ترتيب حسب' },
  { key: 'filter_price_low_high', fr: 'Prix: Croissant', en: 'Price: Low to High', ar: 'السعر: من الأقل للأعلى' },
  { key: 'filter_price_high_low', fr: 'Prix: Décroissant', en: 'Price: High to Low', ar: 'السعر: من الأعلى للأقل' },
  { key: 'filter_newest', fr: 'Plus Récent', en: 'Newest', ar: 'الأحدث' },
  { key: 'filter_oldest', fr: 'Plus Ancien', en: 'Oldest', ar: 'الأقدم' },
  
  // Footer
  { key: 'footer_newsletter', fr: 'Inscrivez-vous à notre newsletter', en: 'Subscribe to our newsletter', ar: 'اشترك في نشرتنا الإخبارية' },
  { key: 'footer_newsletter_desc', fr: 'Recevez les dernières nouvelles et offres spéciales', en: 'Get the latest news and special offers', ar: 'احصل على آخر الأخبار والعروض الخاصة' },
  { key: 'footer_subscribe', fr: 'S\'abonner', en: 'Subscribe', ar: 'اشتراك' },
  { key: 'footer_email_placeholder', fr: 'Votre adresse e-mail', en: 'Your email address', ar: 'عنوان بريدك الإلكتروني' },
  { key: 'footer_company_info', fr: 'Informations sur l\'entreprise', en: 'Company Information', ar: 'معلومات الشركة' },
  { key: 'footer_customer_service', fr: 'Service Client', en: 'Customer Service', ar: 'خدمة العملاء' },
  { key: 'footer_quick_links', fr: 'Liens Rapides', en: 'Quick Links', ar: 'روابط سريعة' },
];

async function seedSectionTranslations() {
  console.log('🌱 Seeding section translations...');
  
  for (const translation of sectionTranslations) {
    for (const lang of ['fr', 'en', 'ar']) {
      await prisma.$executeRaw`
        INSERT OR REPLACE INTO Translation (id, key, language, text, createdAt, updatedAt) 
        VALUES (lower(hex(randomblob(12))), ${translation.key}, ${lang}, ${translation[lang]}, datetime('now'), datetime('now'))
      `;
    }
  }
  
  console.log(`✅ Added ${sectionTranslations.length} section translation keys in 3 languages`);
}

seedSectionTranslations()
  .then(() => {
    console.log('🎉 Section translations seeded successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding section translations:', error);
    process.exit(1);
  });
