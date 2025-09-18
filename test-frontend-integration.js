/**
 * Frontend Integration Test - Verify authentication and content display
 * Tests authentication with admin@gmail.com / admin@gmail.com and content fetching
 */

const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'https://onsi-shop.vercel.app';
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@gmail.com';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const lib = isHttps ? https : http;
    
    const req = lib.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Frontend-Integration-Test',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// Test authentication
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }
    });

    console.log(`Status: ${response.status}`);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Authentication successful');
      console.log(`Token received: ${response.data.token ? 'Yes' : 'No'}`);
      return response.data.token;
    } else {
      console.log('❌ Authentication failed');
      console.log('Response:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return null;
  }
}

// Test content API endpoints
async function testContentEndpoints() {
  console.log('\n📄 Testing Content API Endpoints...');
  
  // Test legacy content endpoint
  try {
    const legacyResponse = await makeRequest(`${BASE_URL}/api/content`);
    console.log(`Legacy Content API (/api/content): ${legacyResponse.status}`);
    
    if (legacyResponse.status === 200) {
      console.log('✅ Legacy content endpoint working');
      console.log(`Content items found: ${Object.keys(legacyResponse.data.data || {}).length}`);
      
      // Check for key content values
      const content = legacyResponse.data.data || {};
      const keyItems = ['hero_title', 'hero_description', 'hero_image_url'];
      keyItems.forEach(key => {
        if (content[key]) {
          console.log(`  ✓ ${key}: ${content[key].substring(0, 50)}...`);
        } else {
          console.log(`  ⚠️  ${key}: Missing`);
        }
      });
    } else {
      console.log('❌ Legacy content endpoint failed');
    }
  } catch (error) {
    console.log('❌ Legacy content endpoint error:', error.message);
  }

  // Test new unified content manager endpoint
  try {
    const unifiedResponse = await makeRequest(`${BASE_URL}/api/content-manager`);
    console.log(`Unified Content API (/api/content-manager): ${unifiedResponse.status}`);
    
    if (unifiedResponse.status === 200) {
      console.log('✅ Unified content endpoint working');
      console.log(`Content items found: ${Object.keys(unifiedResponse.data.data || {}).length}`);
    } else {
      console.log('❌ Unified content endpoint failed');
    }
  } catch (error) {
    console.log('❌ Unified content endpoint error:', error.message);
  }
}

// Test products API
async function testProductsAPI() {
  console.log('\n🛍️ Testing Products API...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/products`);
    console.log(`Products API: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Products API working');
      console.log(`Products found: ${response.data.products?.length || 0}`);
    } else {
      console.log('❌ Products API failed');
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Products API error:', error.message);
  }
}

// Test translations API
async function testTranslationsAPI() {
  console.log('\n🌐 Testing Translations API...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/translations?language=en`);
    console.log(`Translations API: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Translations API working');
      console.log(`Translations found: ${Object.keys(response.data.translations || {}).length}`);
    } else {
      console.log('❌ Translations API failed');
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Translations API error:', error.message);
  }
}

// Test admin endpoints with authentication
async function testAdminEndpoints(token) {
  console.log('\n🔧 Testing Admin Endpoints...');
  
  if (!token) {
    console.log('❌ No auth token available, skipping admin tests');
    return;
  }

  const authHeaders = {
    'Authorization': `Bearer ${token}`
  };

  // Test admin content endpoint
  try {
    const response = await makeRequest(`${BASE_URL}/api/admin/content`, {
      headers: authHeaders
    });
    console.log(`Admin Content API: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Admin content endpoint working');
    } else {
      console.log('❌ Admin content endpoint failed');
    }
  } catch (error) {
    console.log('❌ Admin content endpoint error:', error.message);
  }

  // Test admin media endpoint
  try {
    const response = await makeRequest(`${BASE_URL}/api/admin/media`, {
      headers: authHeaders
    });
    console.log(`Admin Media API: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Admin media endpoint working');
    } else {
      console.log('❌ Admin media endpoint failed');
    }
  } catch (error) {
    console.log('❌ Admin media endpoint error:', error.message);
  }
}

// Test content update functionality
async function testContentUpdate(token) {
  console.log('\n📝 Testing Content Update...');
  
  if (!token) {
    console.log('❌ No auth token available, skipping content update test');
    return;
  }

  try {
    const testContent = {
      key: 'test_integration_key',
      value: `Test integration value - ${new Date().toISOString()}`
    };

    const response = await makeRequest(`${BASE_URL}/api/content-manager`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: testContent
    });

    console.log(`Content Update Test: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Content update working');
      
      // Verify the content was saved
      const verifyResponse = await makeRequest(`${BASE_URL}/api/content-manager`);
      if (verifyResponse.status === 200 && verifyResponse.data.data[testContent.key]) {
        console.log('✅ Content persistence verified');
      } else {
        console.log('⚠️  Content update may not have persisted');
      }
    } else {
      console.log('❌ Content update failed');
      console.log('Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Content update error:', error.message);
  }
}

// Main test function
async function runFrontendIntegrationTests() {
  console.log('🚀 Starting Frontend Integration Tests');
  console.log(`Testing against: ${BASE_URL}`);
  console.log(`Admin credentials: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  
  const startTime = Date.now();

  // Test authentication first
  const token = await testAuthentication();

  // Test all public API endpoints
  await testContentEndpoints();
  await testProductsAPI();
  await testTranslationsAPI();

  // Test admin endpoints with authentication
  await testAdminEndpoints(token);

  // Test content update functionality
  await testContentUpdate(token);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n📊 Test Summary');
  console.log(`Total test duration: ${duration}s`);
  console.log('\n✅ Frontend Integration Tests Complete');
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  console.log('1. All API endpoints should return 200 status codes');
  console.log('2. Authentication should work with provided credentials');
  console.log('3. Content updates should persist to database');
  console.log('4. All components should be able to fetch required data');
}

// Run the tests
runFrontendIntegrationTests().catch(console.error);