const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const adminTranslations = [
  // Admin Dashboard
  { key: 'admin_total_products', fr: 'Total Produits', en: 'Total Products', ar: 'إجمالي المنتجات' },
  { key: 'admin_content_items', fr: 'Éléments de Contenu', en: 'Content Items', ar: 'عناصر المحتوى' },
  { key: 'admin_available_products', fr: 'Produits Disponibles', en: 'Available Products', ar: 'المنتجات المتاحة' },
  { key: 'admin_translation_keys', fr: 'Clés de Traduction', en: 'Translation Keys', ar: 'مفاتيح الترجمة' },
  { key: 'admin_quick_actions', fr: 'Actions Rapides', en: 'Quick Actions', ar: 'إجراءات سريعة' },
  { key: 'admin_recent_products', fr: 'Produits Récents', en: 'Recent Products', ar: 'المنتجات الحديثة' },
  { key: 'admin_no_products_yet', fr: 'Aucun produit pour le moment. Créez votre premier produit pour commencer !', en: 'No products yet. Create your first product to get started!', ar: 'لا توجد منتجات حتى الآن. قم بإنشاء منتجك الأول للبدء!' },
  { key: 'admin_category', fr: 'Catégorie', en: 'Category', ar: 'فئة' },
  { key: 'admin_status', fr: 'Statut', en: 'Status', ar: 'حالة' },
  { key: 'admin_add_product', fr: 'Ajouter un Produit', en: 'Add Product', ar: 'إضافة منتج' },
  { key: 'admin_add_category', fr: 'Ajouter une Catégorie', en: 'Add Category', ar: 'إضافة فئة' },
  { key: 'admin_manage_content', fr: 'Gérer le Contenu', en: 'Manage Content', ar: 'إدارة المحتوى' },
  { key: 'admin_manage_products', fr: 'Gérer les Produits', en: 'Manage Products', ar: 'إدارة المنتجات' },
  { key: 'admin_manage_categories', fr: 'Gérer les Catégories', en: 'Manage Categories', ar: 'إدارة الفئات' },
  { key: 'admin_manage_translations', fr: 'Gérer les Traductions', en: 'Manage Translations', ar: 'إدارة الترجمات' },
];

async function seedAdminTranslations() {
  console.log('🌱 Seeding admin translations...');
  
  for (const translation of adminTranslations) {
    for (const lang of ['fr', 'en', 'ar']) {
      await prisma.$executeRaw`
        INSERT OR REPLACE INTO Translation (id, key, language, text, createdAt, updatedAt) 
        VALUES (lower(hex(randomblob(12))), ${translation.key}, ${lang}, ${translation[lang]}, datetime('now'), datetime('now'))
      `;
    }
  }
  
  console.log(`✅ Added ${adminTranslations.length} admin translation keys in 3 languages`);
}

seedAdminTranslations()
  .then(() => {
    console.log('🎉 Admin translations seeded successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding admin translations:', error);
    process.exit(1);
  });
