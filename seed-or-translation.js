const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const orTranslation = [
  { key: 'common_or', fr: 'Ou', en: 'Or', ar: 'أو' },
];

async function seedOrTranslation() {
  console.log('🌱 Seeding "Or" translation...');
  
  for (const translation of orTranslation) {
    for (const lang of ['fr', 'en', 'ar']) {
      await prisma.$executeRaw`
        INSERT OR REPLACE INTO Translation (id, key, language, text, createdAt, updatedAt) 
        VALUES (lower(hex(randomblob(12))), ${translation.key}, ${lang}, ${translation[lang]}, datetime('now'), datetime('now'))
      `;
    }
  }
  
  console.log(`✅ Added missing translation key`);
}

seedOrTranslation()
  .then(() => {
    console.log('🎉 Missing translation seeded successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error seeding missing translation:', error);
    process.exit(1);
  });
