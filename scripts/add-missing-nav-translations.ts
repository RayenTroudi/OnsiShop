import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const missingTranslations = [
  { key: 'nav_best_sellers', en: 'Best Sellers', fr: 'Meilleures Ventes', ar: 'الأكثر مبيعاً' },
  { key: 'nav_new_arrivals', en: 'New Arrivals', fr: 'Nouveautés', ar: 'وصل حديثاً' },
  { key: 'nav_clothing', en: 'Clothing', fr: 'Vêtements', ar: 'الملابس' },
  { key: 'nav_accessories', en: 'Accessories', fr: 'Accessoires', ar: 'الإكسسوارات' },
]

async function main() {
  console.log('🌱 Adding missing navigation translations...')
  console.log('🔗 Using DATABASE_URL:', process.env.DATABASE_URL?.includes('prisma+postgres') ? 'Prisma Accelerate' : 'Direct connection')

  try {
    // Process each missing translation key
    for (const translationGroup of missingTranslations) {
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
    }

    // Count final translations
    const totalTranslations = await prisma.translation.count()
    const englishCount = await prisma.translation.count({ where: { language: 'en' } })
    const frenchCount = await prisma.translation.count({ where: { language: 'fr' } })
    const arabicCount = await prisma.translation.count({ where: { language: 'ar' } })

    console.log('\n🎉 Missing navigation translations added!')
    console.log(`📊 Total translations: ${totalTranslations}`)
    console.log(`🇺🇸 English: ${englishCount}`)
    console.log(`🇫🇷 French: ${frenchCount}`)
    console.log(`🇸🇦 Arabic: ${arabicCount}`)

    // Verify the specific translations were added
    console.log('\n🔍 Verifying added translations:')
    for (const { key } of missingTranslations) {
      const translations = await prisma.translation.findMany({
        where: { key: key },
        select: { language: true, text: true }
      })
      console.log(`📝 ${key}:`)
      translations.forEach(t => {
        console.log(`   ${t.language}: "${t.text}"`)
      })
    }

  } catch (error) {
    console.error('❌ Error adding missing translations:', error)
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