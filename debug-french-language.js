const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugFrenchLanguage() {
  try {
    console.log('🔍 Debugging French language issue...\n');

    // Check distinct languages
    const distinctLanguages = await prisma.Translation.findMany({
      select: {
        language: true
      },
      distinct: ['language']
    });

    console.log('📋 Distinct languages in database:');
    distinctLanguages.forEach(lang => {
      console.log(`  - "${lang.language}" (length: ${lang.language.length})`);
      // Show character codes to see if there are hidden characters
      const chars = Array.from(lang.language).map(c => c.charCodeAt(0)).join(', ');
      console.log(`    Character codes: [${chars}]`);
    });

    // Manual count for French
    const frenchCount = await prisma.Translation.count({
      where: { language: 'fr' }
    });
    console.log(`\n📊 Manual count for 'fr': ${frenchCount}`);

    // Check some sample French records
    const sampleFrench = await prisma.Translation.findMany({
      where: { language: 'fr' },
      take: 3,
      select: { key: true, language: true, text: true }
    });

    console.log('\n🔍 Sample French records:');
    sampleFrench.forEach(record => {
      console.log(`  ${record.key} (${record.language}): "${record.text}"`);
    });

    // Try querying with different language variations
    const variations = ['fr', 'fr ', ' fr', 'FR'];
    console.log('\n🔍 Testing language variations:');
    for (const variation of variations) {
      const count = await prisma.Translation.count({
        where: { language: variation }
      });
      console.log(`  "${variation}": ${count} records`);
    }

  } catch (error) {
    console.error('❌ Error debugging French language:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugFrenchLanguage();
