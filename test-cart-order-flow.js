const https = require('https');
const http = require('http');

// Use http for localhost
const makeRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const lib = options.hostname === 'localhost' ? http : https;
    const req = lib.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

async function testCartAndOrderFlow() {
  console.log('🧪 Testing Cart and Order System...\n');
  
  try {
    // Test 1: Login as demo user
    console.log('1. Testing login...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const loginResponse = await makeRequest(loginOptions, {
      email: 'demo@example.com',
      password: 'demo123'
    });
    
    console.log(`   Login Status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200) {
      console.log('   Login failed, body:', loginResponse.body);
      return;
    }
    
    // Extract cookies for subsequent requests
    const cookies = loginResponse.headers['set-cookie'] || [];
    const cookieHeader = cookies.join('; ');
    
    console.log('   ✅ Login successful\n');
    
    // Test 2: Get products
    console.log('2. Testing product listing...');
    const productsOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/products',
      method: 'GET',
      headers: {
        'Cookie': cookieHeader
      }
    };
    
    const productsResponse = await makeRequest(productsOptions);
    console.log(`   Products Status: ${productsResponse.statusCode}`);
    
    if (productsResponse.statusCode === 200) {
      const products = JSON.parse(productsResponse.body);
      console.log(`   ✅ Found ${products.length} products\n`);
      
      if (products.length > 0) {
        const testProduct = products[0];
        console.log(`   Testing with product: ${testProduct.name} ($${testProduct.price})\n`);
        
        // Test 3: Add to cart
        console.log('3. Testing add to cart...');
        const cartOptions = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/cart',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader
          }
        };
        
        const cartResponse = await makeRequest(cartOptions, {
          productId: testProduct.id,
          quantity: 2
        });
        
        console.log(`   Add to Cart Status: ${cartResponse.statusCode}`);
        if (cartResponse.statusCode === 200) {
          console.log('   ✅ Product added to cart\n');
          
          // Test 4: Get cart contents
          console.log('4. Testing cart retrieval...');
          const getCartOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/cart',
            method: 'GET',
            headers: {
              'Cookie': cookieHeader
            }
          };
          
          const getCartResponse = await makeRequest(getCartOptions);
          console.log(`   Get Cart Status: ${getCartResponse.statusCode}`);
          
          if (getCartResponse.statusCode === 200) {
            const cart = JSON.parse(getCartResponse.body);
            console.log(`   ✅ Cart has ${cart.items.length} items\n`);
            
            // Test 5: Create order
            console.log('5. Testing order creation...');
            const orderOptions = {
              hostname: 'localhost',
              port: 3000,
              path: '/api/orders',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieHeader
              }
            };
            
            const orderResponse = await makeRequest(orderOptions, {
              shippingAddress: {
                street: '123 Test Street',
                city: 'Test City',
                state: 'Test State',
                zipCode: '12345',
                country: 'Test Country'
              },
              billingAddress: {
                street: '123 Test Street',
                city: 'Test City',
                state: 'Test State',
                zipCode: '12345',
                country: 'Test Country'
              },
              paymentMethod: 'credit-card'
            });
            
            console.log(`   Create Order Status: ${orderResponse.statusCode}`);
            
            if (orderResponse.statusCode === 201) {
              const order = JSON.parse(orderResponse.body);
              console.log(`   ✅ Order created with ID: ${order.id}`);
              console.log(`   Order total: $${order.total}\n`);
              
              // Test 6: Get order details
              console.log('6. Testing order retrieval...');
              const getOrderOptions = {
                hostname: 'localhost',
                port: 3000,
                path: `/api/orders/${order.id}`,
                method: 'GET',
                headers: {
                  'Cookie': cookieHeader
                }
              };
              
              const getOrderResponse = await makeRequest(getOrderOptions);
              console.log(`   Get Order Status: ${getOrderResponse.statusCode}`);
              
              if (getOrderResponse.statusCode === 200) {
                const orderDetails = JSON.parse(getOrderResponse.body);
                console.log(`   ✅ Order details retrieved`);
                console.log(`   Order status: ${orderDetails.status}`);
                console.log(`   Items in order: ${orderDetails.items.length}\n`);
                
                // Test 7: Get user orders
                console.log('7. Testing order listing...');
                const getOrdersOptions = {
                  hostname: 'localhost',
                  port: 3000,
                  path: '/api/orders',
                  method: 'GET',
                  headers: {
                    'Cookie': cookieHeader
                  }
                };
                
                const getOrdersResponse = await makeRequest(getOrdersOptions);
                console.log(`   Get Orders Status: ${getOrdersResponse.statusCode}`);
                
                if (getOrdersResponse.statusCode === 200) {
                  const orders = JSON.parse(getOrdersResponse.body);
                  console.log(`   ✅ Found ${orders.length} orders for user\n`);
                  
                  console.log('🎉 All tests passed! Cart and Order system is working correctly.\n');
                  
                  console.log('📋 Test Summary:');
                  console.log('   ✅ User authentication');
                  console.log('   ✅ Product listing');
                  console.log('   ✅ Add to cart');
                  console.log('   ✅ Cart retrieval');
                  console.log('   ✅ Order creation');
                  console.log('   ✅ Order retrieval');
                  console.log('   ✅ Order listing');
                  
                } else {
                  console.log(`   ❌ Get orders failed: ${getOrdersResponse.body}`);
                }
              } else {
                console.log(`   ❌ Get order failed: ${getOrderResponse.body}`);
              }
            } else {
              console.log(`   ❌ Create order failed: ${orderResponse.body}`);
            }
          } else {
            console.log(`   ❌ Get cart failed: ${getCartResponse.body}`);
          }
        } else {
          console.log(`   ❌ Add to cart failed: ${cartResponse.body}`);
        }
      } else {
        console.log('   ❌ No products found to test with');
      }
    } else {
      console.log(`   ❌ Get products failed: ${productsResponse.body}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testCartAndOrderFlow();
