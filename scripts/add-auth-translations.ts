import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const authTranslations = [
  // Basic auth actions
  { key: 'auth_sign_in', en: 'Sign In', fr: 'Se Connecter', ar: 'تسجيل الدخول' },
  { key: 'auth_signing_in', en: 'Signing In...', fr: 'Connexion...', ar: 'جاري تسجيل الدخول...' },
  { key: 'auth_create_account', en: 'Create Account', fr: 'Créer un Compte', ar: 'إنشاء حساب' },
  { key: 'auth_creating_account', en: 'Creating Account...', fr: 'Création du Compte...', ar: 'جاري إنشاء الحساب...' },
  { key: 'auth_create_new_account', en: 'Create New Account', fr: 'Créer un Nouveau Compte', ar: 'إنشاء حساب جديد' },
  { key: 'auth_sign_existing_account', en: 'Sign in to existing account', fr: 'Se connecter au compte existant', ar: 'تسجيل الدخول إلى حساب موجود' },
  { key: 'auth_back_to_store', en: 'Back to Store', fr: 'Retour au Magasin', ar: 'العودة إلى المتجر' },

  // Form fields
  { key: 'auth_email_address', en: 'Email Address', fr: 'Adresse Email', ar: 'عنوان البريد الإلكتروني' },
  { key: 'auth_password', en: 'Password', fr: 'Mot de Passe', ar: 'كلمة المرور' },
  { key: 'auth_confirm_password', en: 'Confirm Password', fr: 'Confirmer le Mot de Passe', ar: 'تأكيد كلمة المرور' },
  { key: 'auth_confirm_password_placeholder', en: 'Confirm your password', fr: 'Confirmez votre mot de passe', ar: 'أكد كلمة المرور' },
  { key: 'auth_password_min_chars', en: 'Minimum 6 characters', fr: 'Minimum 6 caractères', ar: 'حد أدنى 6 أحرف' },

  // Demo credentials
  { key: 'auth_demo_credentials', en: 'Demo Credentials', fr: 'Identifiants de Démonstration', ar: 'بيانات اعتماد العرض التوضيحي' },
  { key: 'auth_admin', en: 'Admin', fr: 'Administrateur', ar: 'المدير' },
  { key: 'auth_user', en: 'User', fr: 'Utilisateur', ar: 'المستخدم' },

  // Checkout-related auth
  { key: 'auth_continue_checkout', en: 'Continue to checkout', fr: 'Continuer vers le paiement', ar: 'المتابعة إلى الدفع' },
  { key: 'auth_continue_checkout_register', en: 'Continue to checkout after registration', fr: 'Continuer vers le paiement après inscription', ar: 'المتابعة إلى الدفع بعد التسجيل' },

  // Error messages
  { key: 'auth_passwords_not_match', en: 'Passwords do not match', fr: 'Les mots de passe ne correspondent pas', ar: 'كلمات المرور غير متطابقة' },
  { key: 'auth_password_min_length', en: 'Password must be at least 6 characters', fr: 'Le mot de passe doit contenir au moins 6 caractères', ar: 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل' },
  { key: 'auth_network_error', en: 'Network error. Please try again.', fr: 'Erreur réseau. Veuillez réessayer.', ar: 'خطأ في الشبكة. يرجى المحاولة مرة أخرى.' },

  // Common word "or"
  { key: 'common_or', en: 'or', fr: 'ou', ar: 'أو' },
]

async function main() {
  console.log('🌱 Adding missing authentication translations...')
  console.log('🔗 Using DATABASE_URL:', process.env.DATABASE_URL?.includes('prisma+postgres') ? 'Prisma Accelerate' : 'Direct connection')

  try {
    let addedCount = 0

    // Process each missing translation key
    for (const translationGroup of authTranslations) {
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

    console.log('\n🎉 Authentication translations completed!')
    console.log(`📊 Added: ${addedCount} new translation keys`)
    console.log(`📊 Total translations: ${totalTranslations}`)
    console.log(`🇺🇸 English: ${englishCount}`)
    console.log(`🇫🇷 French: ${frenchCount}`)
    console.log(`🇸🇦 Arabic: ${arabicCount}`)

    // Verify some key translations were added
    console.log('\n🔍 Verifying key auth translations:')
    const keyTranslationsToCheck = ['auth_sign_in', 'auth_create_new_account', 'auth_demo_credentials', 'auth_email_address', 'common_or']
    
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
    console.error('❌ Error adding authentication translations:', error)
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