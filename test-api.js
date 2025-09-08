// Test translation API directly
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTranslationAPI() {
  try {
    console.log('🧪 Testing Translation API Logic...');
    
    // Simulate the API logic
    const language = 'fr';
    const translations = await prisma.translation.findMany({
      where: { language },
      select: {
        key: true,
        text: true
      }
    });

    const translationMap = {};
    translations.forEach(t => {
      translationMap[t.key] = t.text;
    });

    console.log(`📊 Loaded ${translations.length} translations for ${language}`);
    
    // Test the specific keys that were missing
    const testKeys = [
      'promo_free_shipping',
      'footer_copyright', 
      'footer_all_rights_reserved',
      'footer_disclaimer_title',
      'footer_disclaimer_text'
    ];
    
    console.log('\n🔍 Testing missing keys:');
    testKeys.forEach(key => {
      if (translationMap[key]) {
        console.log(`✅ ${key}: "${translationMap[key].substring(0, 50)}${translationMap[key].length > 50 ? '...' : ''}"`);
      } else {
        console.log(`❌ ${key}: MISSING`);
      }
    });
    
    // Test a few other common keys
    console.log('\n🔍 Testing other common keys:');
    const commonKeys = ['auth_email', 'auth_password', 'cart_title', 'product_add_to_cart'];
    commonKeys.forEach(key => {
      if (translationMap[key]) {
        console.log(`✅ ${key}: "${translationMap[key]}"`);
      } else {
        console.log(`❌ ${key}: MISSING`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing translation API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testTranslationAPI();
