const testAuthentication = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔐 Testing Authentication System...\n');
  
  try {
    // Step 1: Test unauthenticated request to /api/auth/me
    console.log('1️⃣ Testing unauthenticated /api/auth/me request...');
    const unauthResponse = await fetch(`${baseUrl}/api/auth/me`, {
      credentials: 'include'
    });
    console.log(`   Status: ${unauthResponse.status}`);
    const unauthData = await unauthResponse.json();
    console.log(`   Response: ${JSON.stringify(unauthData)}`);
    
    if (unauthResponse.status === 401) {
      console.log('   ✅ Correctly returns 401 for unauthenticated user\n');
    } else {
      console.log('   ⚠️ Unexpected response for unauthenticated user\n');
    }
    
    // Step 2: Login with provided credentials
    console.log('2️⃣ Testing login with admin@onsishop.com / admin123...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'admin@onsishop.com',
        password: 'admin123'
      }),
    });
    
    console.log(`   Login Status: ${loginResponse.status}`);
    const loginData = await loginResponse.json();
    console.log(`   Login Response: ${JSON.stringify(loginData, null, 2)}`);
    
    if (loginResponse.ok && loginData.user) {
      console.log('   ✅ Login successful!\n');
      
      // Step 3: Test authenticated request
      console.log('3️⃣ Testing authenticated /api/auth/me request...');
      const authResponse = await fetch(`${baseUrl}/api/auth/me`, {
        credentials: 'include',
        headers: {
          'Cookie': loginResponse.headers.get('set-cookie') || ''
        }
      });
      
      console.log(`   Auth Status: ${authResponse.status}`);
      const authData = await authResponse.json();
      console.log(`   Auth Response: ${JSON.stringify(authData, null, 2)}`);
      
      if (authResponse.ok && authData.user) {
        console.log('   ✅ Authentication working correctly!\n');
      } else {
        console.log('   ❌ Auth verification failed\n');
      }
      
    } else {
      console.log('   ❌ Login failed!\n');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testAuthentication().then(() => {
  console.log('🎯 Authentication test completed');
}).catch(err => {
  console.error('💥 Authentication test error:', err);
});