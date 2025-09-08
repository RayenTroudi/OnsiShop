const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNavigationTranslations() {
  console.log('🧪 Testing navigation translation system...');
  
  try {
    // Test fetching all navigation keys
    const navKeys = ['nav_best_sellers', 'nav_new_arrivals', 'nav_clothing', 'nav_accessories'];
    
    console.log('\n📋 Testing navigation translation keys:');
    for (const key of navKeys) {
      console.log(`\n🔑 Key: ${key}`);
      
      const translations = await prisma.translation.findMany({
        where: { key: key },
        orderBy: { language: 'asc' }
      });
      
      if (translations.length === 0) {
        console.log(`❌ No translations found for ${key}`);
      } else {
        translations.forEach(t => {
          console.log(`  ${t.language}: "${t.text}"`);
        });
      }
    }
    
    // Test API endpoint
    console.log('\n🌐 Testing API endpoint...');
    
    const fetch = (await import('node-fetch')).default;
    
    // Test French translations
    const frResponse = await fetch('http://localhost:3000/api/translations?language=fr');
    if (frResponse.ok) {
      const frData = await frResponse.json();
      const navTranslations = Object.entries(frData).filter(([key]) => key.startsWith('nav_'));
      
      console.log(`✅ French API: ${navTranslations.length} navigation translations found`);
      navTranslations.forEach(([key, value]) => {
        console.log(`  ${key}: "${value}"`);
      });
    } else {
      console.log('❌ Failed to fetch French translations from API');
    }
    
    console.log('\n🎉 Navigation translation test completed!');
    
  } catch (error) {
    console.error('❌ Error testing navigation translations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNavigationTranslations();
