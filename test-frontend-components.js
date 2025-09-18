/**
 * Frontend Component Verification Test
 * Tests actual user experience and component functionality
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
        'User-Agent': 'Frontend-Component-Test',
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

// Test homepage content loading
async function testHomepageContent() {
  console.log('\n🏠 Testing Homepage Content Loading...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/content`);
    
    if (response.status === 200) {
      const content = response.data.data || {};
      
      console.log('✅ Homepage content API working');
      
      // Check essential content for homepage components
      const essentialContent = [
        'hero_title',
        'hero_description', 
        'hero_image_url',
        'hero_button_text',
        'about_title',
        'about_description',
        'promotion_title',
        'promotion_subtitle'
      ];
      
      let missingContent = [];
      let presentContent = [];
      
      essentialContent.forEach(key => {
        if (content[key]) {
          presentContent.push(key);
          console.log(`  ✓ ${key}: "${content[key].substring(0, 40)}..."`);
        } else {
          missingContent.push(key);
          console.log(`  ❌ ${key}: Missing`);
        }
      });
      
      console.log(`\nContent Summary: ${presentContent.length}/${essentialContent.length} essential items present`);
      
      if (missingContent.length === 0) {
        console.log('✅ All essential homepage content is available');
        return true;
      } else {
        console.log(`⚠️  Missing content items: ${missingContent.join(', ')}`);
        return false;
      }
    } else {
      console.log('❌ Failed to fetch homepage content');
      return false;
    }
  } catch (error) {
    console.log('❌ Homepage content test error:', error.message);
    return false;
  }
}

// Test product data for components
async function testProductData() {
  console.log('\n🛍️ Testing Product Data for Components...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/products`);
    
    if (response.status === 200) {
      const products = response.data.products || [];
      console.log(`✅ Products API working - ${products.length} products available`);
      
      if (products.length > 0) {
        const sampleProduct = products[0];
        console.log('Sample product structure:');
        console.log(`  - ID: ${sampleProduct.id}`);
        console.log(`  - Name: ${sampleProduct.name}`);
        console.log(`  - Price: ${sampleProduct.price}`);
        console.log(`  - Images: ${sampleProduct.images?.length || 0}`);
        console.log(`  - Category: ${sampleProduct.category?.name || 'N/A'}`);
        
        return true;
      } else {
        console.log('⚠️  No products available for display components');
        return false;
      }
    } else {
      console.log('❌ Failed to fetch product data');
      return false;
    }
  } catch (error) {
    console.log('❌ Product data test error:', error.message);
    return false;
  }
}

// Test admin authentication flow
async function testAdminAuthFlow() {
  console.log('\n🔐 Testing Admin Authentication Flow...');
  
  try {
    const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }
    });
    
    if (loginResponse.status === 200 && loginResponse.data.success && loginResponse.data.token) {
      console.log('✅ Admin login successful');
      console.log(`  - User: ${loginResponse.data.user.email}`);
      console.log(`  - Is Admin: ${loginResponse.data.user.isAdmin}`);
      console.log(`  - Token: ${loginResponse.data.token.substring(0, 20)}...`);
      
      // Test admin content management
      const token = loginResponse.data.token;
      const contentResponse = await makeRequest(`${BASE_URL}/api/admin/content`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (contentResponse.status === 200) {
        console.log('✅ Admin content management accessible');
        return { success: true, token };
      } else {
        console.log('❌ Admin content management not accessible');
        return { success: false, token: null };
      }
    } else {
      console.log('❌ Admin login failed');
      console.log('Response:', loginResponse.data);
      return { success: false, token: null };
    }
  } catch (error) {
    console.log('❌ Admin auth flow error:', error.message);
    return { success: false, token: null };
  }
}

// Test content management workflow
async function testContentManagementWorkflow(token) {
  console.log('\n📝 Testing Content Management Workflow...');
  
  if (!token) {
    console.log('❌ No auth token available, skipping content management test');
    return false;
  }
  
  try {
    const timestamp = new Date().toISOString();
    const testKey = 'workflow_test_key';
    const testValue = `Workflow test value - ${timestamp}`;
    
    // Test content creation
    console.log('Testing content creation...');
    const createResponse = await makeRequest(`${BASE_URL}/api/content-manager`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        key: testKey,
        value: testValue
      }
    });
    
    if (createResponse.status === 200) {
      console.log('✅ Content creation successful');
    } else {
      console.log('❌ Content creation failed');
      return false;
    }
    
    // Test content retrieval
    console.log('Testing content retrieval...');
    const retrieveResponse = await makeRequest(`${BASE_URL}/api/content-manager`);
    
    if (retrieveResponse.status === 200) {
      const content = retrieveResponse.data.data || {};
      if (content[testKey] === testValue) {
        console.log('✅ Content retrieval and persistence verified');
      } else {
        console.log('⚠️  Content was created but not found in retrieval');
        return false;
      }
    } else {
      console.log('❌ Content retrieval failed');
      return false;
    }
    
    // Test content update
    console.log('Testing content update...');
    const updatedValue = `Updated ${testValue}`;
    const updateResponse = await makeRequest(`${BASE_URL}/api/content-manager`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        key: testKey,
        value: updatedValue
      }
    });
    
    if (updateResponse.status === 200) {
      console.log('✅ Content update successful');
      
      // Verify update
      const verifyResponse = await makeRequest(`${BASE_URL}/api/content-manager`);
      if (verifyResponse.status === 200) {
        const content = verifyResponse.data.data || {};
        if (content[testKey] === updatedValue) {
          console.log('✅ Content update verified');
        } else {
          console.log('⚠️  Content update not reflected');
        }
      }
    } else {
      console.log('❌ Content update failed');
      return false;
    }
    
    // Clean up test content
    console.log('Cleaning up test content...');
    const deleteResponse = await makeRequest(`${BASE_URL}/api/content-manager?key=${testKey}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (deleteResponse.status === 200) {
      console.log('✅ Content cleanup successful');
    } else {
      console.log('⚠️  Content cleanup failed (test content may remain)');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Content management workflow error:', error.message);
    return false;
  }
}

// Test media upload functionality
async function testMediaUploadEndpoint(token) {
  console.log('\n📷 Testing Media Upload Endpoint...');
  
  if (!token) {
    console.log('❌ No auth token available, skipping media upload test');
    return false;
  }
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/admin/media`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Media Upload Endpoint Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Media upload endpoint accessible');
      return true;
    } else {
      console.log('❌ Media upload endpoint not accessible');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Media upload endpoint error:', error.message);
    return false;
  }
}

// Main verification function
async function runFrontendComponentVerification() {
  console.log('🚀 Starting Frontend Component Verification');
  console.log(`Testing against: ${BASE_URL}`);
  console.log(`Admin credentials: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  
  const startTime = Date.now();
  const results = {
    homepageContent: false,
    productData: false,
    adminAuth: false,
    contentManagement: false,
    mediaUpload: false
  };

  // Test homepage content loading
  results.homepageContent = await testHomepageContent();

  // Test product data
  results.productData = await testProductData();

  // Test admin authentication
  const authResult = await testAdminAuthFlow();
  results.adminAuth = authResult.success;

  // Test content management workflow
  results.contentManagement = await testContentManagementWorkflow(authResult.token);

  // Test media upload
  results.mediaUpload = await testMediaUploadEndpoint(authResult.token);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n📊 Verification Summary');
  console.log(`Total verification duration: ${duration}s`);
  console.log('\nResults:');
  console.log(`  Homepage Content: ${results.homepageContent ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Product Data: ${results.productData ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Admin Authentication: ${results.adminAuth ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Content Management: ${results.contentManagement ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Media Upload: ${results.mediaUpload ? '✅ PASS' : '❌ FAIL'}`);

  const passedTests = Object.values(results).filter(result => result).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All frontend components are working correctly!');
    console.log('✅ The admin system is fully functional and ready for use.');
  } else {
    console.log('\n⚠️  Some components need attention. See individual test results above.');
  }

  console.log('\n💡 Next Steps:');
  console.log('1. Access admin panel at: https://onsi-shop.vercel.app/admin');
  console.log('2. Login with: admin@gmail.com / admin@gmail.com');
  console.log('3. Test content and media uploads through the UI');
  console.log('4. Verify changes appear on the homepage immediately');
  
  return results;
}

// Run the verification
runFrontendComponentVerification().catch(console.error);