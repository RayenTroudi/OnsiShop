// Test script to debug cart authentication
console.log('Testing cart authentication...');

// Check if we can access the cart API while logged in
async function testCartAuth() {
  try {
    console.log('1. Testing /api/auth/me');
    const authResponse = await fetch('http://localhost:3000/api/auth/me', {
      credentials: 'include'
    });
    console.log('Auth status:', authResponse.status);
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('Current user:', authData);
    }

    console.log('\n2. Testing /api/cart');
    const cartResponse = await fetch('http://localhost:3000/api/cart', {
      credentials: 'include'
    });
    console.log('Cart status:', cartResponse.status);
    const cartData = await cartResponse.json();
    console.log('Cart data:', cartData);

    console.log('\n3. Testing /api/cart/add');
    const addResponse = await fetch('http://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        productId: 'cmf2em0a3000i96yw3ezesy65',
        quantity: 1
      })
    });
    console.log('Add to cart status:', addResponse.status);
    const addData = await addResponse.json();
    console.log('Add to cart response:', addData);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCartAuth();
