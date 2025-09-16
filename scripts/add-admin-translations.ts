import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const adminTranslations = [
  // Admin Dashboard Stats
  { key: 'admin_total_products', en: 'Total Products', fr: 'Total des Produits', ar: 'إجمالي المنتجات' },
  { key: 'admin_content_items', en: 'Content Items', fr: 'Éléments de Contenu', ar: 'عناصر المحتوى' },
  { key: 'admin_available_products', en: 'Available Products', fr: 'Produits Disponibles', ar: 'المنتجات المتاحة' },
  { key: 'admin_translation_keys', en: 'Translation Keys', fr: 'Clés de Traduction', ar: 'مفاتيح الترجمة' },

  // Admin Quick Actions
  { key: 'admin_quick_actions', en: 'Quick Actions', fr: 'Actions Rapides', ar: 'إجراءات سريعة' },
  { key: 'admin_add_product', en: 'Add Product', fr: 'Ajouter un Produit', ar: 'إضافة منتج' },
  { key: 'admin_add_category', en: 'Add Category', fr: 'Ajouter une Catégorie', ar: 'إضافة فئة' },
  { key: 'admin_manage_content', en: 'Manage Content', fr: 'Gérer le Contenu', ar: 'إدارة المحتوى' },
  { key: 'admin_manage_products', en: 'Manage Products', fr: 'Gérer les Produits', ar: 'إدارة المنتجات' },
  { key: 'admin_manage_categories', en: 'Manage Categories', fr: 'Gérer les Catégories', ar: 'إدارة الفئات' },
  { key: 'admin_manage_translations', en: 'Manage Translations', fr: 'Gérer les Traductions', ar: 'إدارة الترجمات' },

  // Admin Recent Products Section
  { key: 'admin_recent_products', en: 'Recent Products', fr: 'Produits Récents', ar: 'المنتجات الحديثة' },
  { key: 'admin_no_products_yet', en: 'No products yet', fr: 'Aucun produit encore', ar: 'لا توجد منتجات بعد' },
  { key: 'admin_category', en: 'Category', fr: 'Catégorie', ar: 'الفئة' },
  { key: 'admin_status', en: 'Status', fr: 'Statut', ar: 'الحالة' },

  // Already seeded admin translations (just making sure they exist)
  { key: 'admin_dashboard', en: 'Dashboard', fr: 'Tableau de Bord', ar: 'لوحة التحكم' },
  { key: 'admin_products', en: 'Products', fr: 'Produits', ar: 'المنتجات' },
  { key: 'admin_orders', en: 'Orders', fr: 'Commandes', ar: 'الطلبات' },
  { key: 'admin_customers', en: 'Customers', fr: 'Clients', ar: 'العملاء' },
  { key: 'admin_settings', en: 'Settings', fr: 'Paramètres', ar: 'الإعدادات' },

  // Additional admin translations that might be needed
  { key: 'admin_overview', en: 'Overview', fr: 'Aperçu', ar: 'نظرة عامة' },
  { key: 'admin_statistics', en: 'Statistics', fr: 'Statistiques', ar: 'الإحصائيات' },
  { key: 'admin_analytics', en: 'Analytics', fr: 'Analytique', ar: 'التحليلات' },
  { key: 'admin_reports', en: 'Reports', fr: 'Rapports', ar: 'التقارير' },
  { key: 'admin_users', en: 'Users', fr: 'Utilisateurs', ar: 'المستخدمون' },
  { key: 'admin_inventory', en: 'Inventory', fr: 'Inventaire', ar: 'المخزون' },
  { key: 'admin_sales', en: 'Sales', fr: 'Ventes', ar: 'المبيعات' },
  { key: 'admin_revenue', en: 'Revenue', fr: 'Revenus', ar: 'الإيرادات' },

  // Admin form and table headers
  { key: 'admin_name', en: 'Name', fr: 'Nom', ar: 'الاسم' },
  { key: 'admin_description', en: 'Description', fr: 'Description', ar: 'الوصف' },
  { key: 'admin_price', en: 'Price', fr: 'Prix', ar: 'السعر' },
  { key: 'admin_image', en: 'Image', fr: 'Image', ar: 'الصورة' },
  { key: 'admin_created', en: 'Created', fr: 'Créé', ar: 'تم الإنشاء' },
  { key: 'admin_updated', en: 'Updated', fr: 'Mis à jour', ar: 'تم التحديث' },
  { key: 'admin_actions', en: 'Actions', fr: 'Actions', ar: 'الإجراءات' },
  { key: 'admin_edit', en: 'Edit', fr: 'Modifier', ar: 'تعديل' },
  { key: 'admin_delete', en: 'Delete', fr: 'Supprimer', ar: 'حذف' },
  { key: 'admin_view', en: 'View', fr: 'Voir', ar: 'عرض' },

  // Admin messages
  { key: 'admin_success_created', en: 'Successfully created', fr: 'Créé avec succès', ar: 'تم الإنشاء بنجاح' },
  { key: 'admin_success_updated', en: 'Successfully updated', fr: 'Mis à jour avec succès', ar: 'تم التحديث بنجاح' },
  { key: 'admin_success_deleted', en: 'Successfully deleted', fr: 'Supprimé avec succès', ar: 'تم الحذف بنجاح' },
  { key: 'admin_error_occurred', en: 'An error occurred', fr: 'Une erreur s\'est produite', ar: 'حدث خطأ' },
  { key: 'admin_confirm_delete', en: 'Are you sure you want to delete this item?', fr: 'Êtes-vous sûr de vouloir supprimer cet élément?', ar: 'هل أنت متأكد من أنك تريد حذف هذا العنصر؟' },

  // The nav_categories that was missing
  { key: 'nav_categories', en: 'Categories', fr: 'Catégories', ar: 'الفئات' },
]

async function main() {
  console.log('🌱 Adding missing admin translations...')
  console.log('🔗 Using DATABASE_URL:', process.env.DATABASE_URL?.includes('prisma+postgres') ? 'Prisma Accelerate' : 'Direct connection')

  try {
    let addedCount = 0

    // Process each admin translation key
    for (const translationGroup of adminTranslations) {
      const { key, en, fr, ar } = translationGroup

      // Check if translation already exists and skip if it does
      const existingEn = await prisma.translation.findUnique({
        where: {
          key_language: {
            key: key,
            language: 'en'
          }
        }
      })

      if (existingEn) {
        console.log(`⚠️  Translation ${key} already exists, skipping...`)
        continue
      }

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

      console.log(`✅ Added translation: ${key}`)
      console.log(`   EN: "${en}"`)
      console.log(`   FR: "${fr}"`)
      console.log(`   AR: "${ar}"`)
      addedCount++
    }

    // Count final translations
    const totalTranslations = await prisma.translation.count()
    const englishCount = await prisma.translation.count({ where: { language: 'en' } })
    const frenchCount = await prisma.translation.count({ where: { language: 'fr' } })
    const arabicCount = await prisma.translation.count({ where: { language: 'ar' } })

    console.log('\n🎉 Admin translations completed!')
    console.log(`📊 Added: ${addedCount} new translation keys`)
    console.log(`📊 Total translations: ${totalTranslations}`)
    console.log(`🇺🇸 English: ${englishCount}`)
    console.log(`🇫🇷 French: ${frenchCount}`)
    console.log(`🇸🇦 Arabic: ${arabicCount}`)

    // Verify key admin translations were added
    console.log('\n🔍 Verifying key admin translations:')
    const keyTranslationsToCheck = ['admin_total_products', 'admin_quick_actions', 'admin_manage_content', 'nav_categories', 'admin_no_products_yet']
    
    for (const key of keyTranslationsToCheck) {
      const translations = await prisma.translation.findMany({
        where: { key: key },
        select: { language: true, text: true }
      })
      if (translations.length > 0) {
        console.log(`📝 ${key}:`)
        translations.forEach(t => {
          console.log(`   ${t.language}: "${t.text}"`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Error adding admin translations:', error)
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