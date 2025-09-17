import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const missingTranslations = [
  // Additional Auth keys found in register component
  { key: 'auth_passwords_not_match', en: 'Passwords do not match', fr: 'Les mots de passe ne correspondent pas', ar: 'كلمات المرور غير متطابقة' },
  { key: 'auth_password_min_length', en: 'Password must be at least 6 characters', fr: 'Le mot de passe doit contenir au moins 6 caractères', ar: 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل' },
  
  // Navigation keys used in Menu component
  { key: 'nav_best_sellers', en: 'Best Sellers', fr: 'Meilleures Ventes', ar: 'الأكثر مبيعاً' },
  { key: 'nav_new_arrivals', en: 'New Arrivals', fr: 'Nouveautés', ar: 'وصل حديثاً' },
  { key: 'nav_clothing', en: 'Clothing', fr: 'Vêtements', ar: 'الملابس' },
  { key: 'nav_accessories', en: 'Accessories', fr: 'Accessoires', ar: 'إكسسوارات' },
  
  // Footer keys used in SocialMedia component
  { key: 'nav_follow_us', en: 'Follow Us', fr: 'Suivez-Nous', ar: 'تابعنا' },
  
  // Additional common keys that might be used
  { key: 'nav_all_products', en: 'All Products', fr: 'Tous les Produits', ar: 'جميع المنتجات' },
  { key: 'nav_categories', en: 'Categories', fr: 'Catégories', ar: 'الفئات' },
  { key: 'nav_brands', en: 'Brands', fr: 'Marques', ar: 'العلامات التجارية' },
  { key: 'nav_deals', en: 'Deals', fr: 'Offres', ar: 'العروض' },
  { key: 'nav_sale', en: 'Sale', fr: 'Soldes', ar: 'تخفيضات' },
  { key: 'nav_wishlist', en: 'Wishlist', fr: 'Liste des Souhaits', ar: 'قائمة الرغبات' },
  { key: 'nav_profile', en: 'Profile', fr: 'Profil', ar: 'الملف الشخصي' },
  { key: 'nav_orders', en: 'Orders', fr: 'Commandes', ar: 'الطلبات' },
  { key: 'nav_logout', en: 'Logout', fr: 'Déconnexion', ar: 'تسجيل الخروج' },
  { key: 'nav_login', en: 'Login', fr: 'Connexion', ar: 'تسجيل الدخول' },
  { key: 'nav_register', en: 'Register', fr: 'S\'inscrire', ar: 'إنشاء حساب' },
]

async function main() {
  console.log('🌱 Adding missing translation keys...')

  try {
    let processedCount = 0;
    
    // Process each translation key
    for (const translationGroup of missingTranslations) {
      const { key, en, fr, ar } = translationGroup

      // Insert English translation
      await prisma.translation.upsert({
        where: { key_language: { key: key, language: 'en' } },
        update: { text: en },
        create: { key: key, language: 'en', text: en }
      })

      // Insert French translation
      await prisma.translation.upsert({
        where: { key_language: { key: key, language: 'fr' } },
        update: { text: fr },
        create: { key: key, language: 'fr', text: fr }
      })

      // Insert Arabic translation
      await prisma.translation.upsert({
        where: { key_language: { key: key, language: 'ar' } },
        update: { text: ar },
        create: { key: key, language: 'ar', text: ar }
      })

      processedCount++
      console.log(`✅ Added translation: ${key}`)
    }

    // Count final translations
    const totalTranslations = await prisma.translation.count()
    const englishCount = await prisma.translation.count({ where: { language: 'en' } })
    const frenchCount = await prisma.translation.count({ where: { language: 'fr' } })
    const arabicCount = await prisma.translation.count({ where: { language: 'ar' } })

    console.log('\n🎉 Missing translation keys added!')
    console.log(`📊 Total translations: ${totalTranslations}`)
    console.log(`🇺🇸 English: ${englishCount}`)
    console.log(`🇫🇷 French: ${frenchCount}`)
    console.log(`🇸🇦 Arabic: ${arabicCount}`)
    console.log(`🔄 Added ${processedCount} missing translation groups`)

  } catch (error) {
    console.error('❌ Error adding translations:', error)
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