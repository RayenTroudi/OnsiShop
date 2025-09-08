const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const missingTranslations = [
  { key: 'nav_orders', fr: 'Mes Commandes', en: 'My Orders', ar: 'طلباتي' },
];

async function seedMissingTranslations() {
  console.log('🌱 Seeding missing translations...');
  
  for (const translation of missingTranslations) {
    for (const lang of ['fr', 'en', 'ar']) {
      await prisma.$executeRaw`
        INSERT OR REPLACE INTO Translation (id, key, language, text, createdAt, updatedAt) 
        VALUES (lower(hex(randomblob(12))), ${translation.key}, ${lang}, ${translation[lang]}, datetime('now'), datetime('now'))
      `;
    }
  }
  
  console.log(`✅ Added ${missingTranslations.length} missing translation keys in 3 languages`);
}

seedMissingTranslations()
  .then(() => {
    console.log('🎉 Missing translations seeded successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding missing translations:', error);
    process.exit(1);
  });
