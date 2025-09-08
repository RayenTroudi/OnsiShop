// Test the translation API
async function testTranslationAPI() {
  const baseUrl = 'http://localhost:3000/api/translations';
  
  try {
    console.log('Testing GET /api/translations?language=fr...');
    const response = await fetch(baseUrl + '?language=fr');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ GET API works!');
      console.log(`Found ${Object.keys(data).length} French translations:`);
      Object.entries(data).forEach(([key, text]) => {
        console.log(`  ${key}: ${text}`);
      });
    } else {
      console.log('❌ GET API failed:', data);
    }

    // Test all languages
    console.log('\nTesting all languages...');
    for (const lang of ['fr', 'en', 'ar']) {
      const langResponse = await fetch(baseUrl + `?language=${lang}`);
      const langData = await langResponse.json();
      if (langResponse.ok) {
        console.log(`✅ ${lang}: ${Object.keys(langData).length} translations`);
      } else {
        console.log(`❌ ${lang}: API failed -`, langData);
      }
    }
  } catch (error) {
    console.log('❌ Error testing API:', error.message);
  }
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testTranslationAPI();
}
