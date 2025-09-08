async function testFrenchTranslationsQuick() {
  try {
    console.log('🧪 Quick test of French translations...\n');

    const response = await fetch('http://localhost:3000/api/translations?language=fr');
    
    if (!response.ok) {
      console.log(`❌ API Response: ${response.status} ${response.statusText}`);
      return;
    }

    const translations = await response.json();
    console.log(`📊 API returned ${Object.keys(translations).length} French translations`);

    // Test the specific keys mentioned in the warnings
    const warningKeys = [
      'hero_alt_text', 'hero_title', 'hero_subtitle', 'hero_description',
      'promo_free_shipping', 'promo_title', 'promo_subtitle', 'promo_button',
      'section_about_us_title', 'about_title', 'about_description', 'about_button_text',
      'nav_navigation', 'nav_follow_us', 
      'footer_copyright', 'footer_all_rights_reserved', 'footer_disclaimer_title', 'footer_disclaimer_text'
    ];

    console.log('\n🔍 Checking keys from warning messages:');
    let foundCount = 0;
    let missingCount = 0;

    warningKeys.forEach(key => {
      if (translations[key]) {
        console.log(`  ✅ ${key}: "${translations[key].substring(0, 50)}${translations[key].length > 50 ? '...' : ''}"`);
        foundCount++;
      } else {
        console.log(`  ❌ ${key}: MISSING`);
        missingCount++;
      }
    });

    console.log(`\n📈 Results: ${foundCount} found, ${missingCount} missing`);

    if (missingCount === 0) {
      console.log('\n🎉 All French translations are present in the API!');
      console.log('The warnings you see are likely from initial SSR/hydration timing.');
    } else {
      console.log('\n⚠️ Some translations are genuinely missing from the database.');
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testFrenchTranslationsQuick();
