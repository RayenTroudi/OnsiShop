async function testTranslationAPI() {
  try {
    console.log('🔍 Testing translation API...\n');

    // Test French translations
    const frResponse = await fetch('http://localhost:3000/api/translations?language=fr');
    if (frResponse.ok) {
      const frData = await frResponse.json();
      console.log(`📊 French translations count: ${Object.keys(frData).length}`);
      
      // Check specific keys we know should exist
      const testKeys = ['hero_title', 'promo_title', 'about_title', 'nav_navigation'];
      
      console.log('\n🔍 Testing specific keys in French:');
      testKeys.forEach(key => {
        if (frData[key]) {
          console.log(`  ✅ ${key}: "${frData[key]}"`);
        } else {
          console.log(`  ❌ ${key}: MISSING`);
        }
      });
    } else {
      console.log(`❌ French API failed: ${frResponse.status} ${frResponse.statusText}`);
    }

    // Test English translations for comparison
    const enResponse = await fetch('http://localhost:3000/api/translations?language=en');
    if (enResponse.ok) {
      const enData = await enResponse.json();
      console.log(`\n📊 English translations count: ${Object.keys(enData).length}`);
    }

  } catch (error) {
    console.error('❌ Error testing translation API:', error);
  }
}

testTranslationAPI();
