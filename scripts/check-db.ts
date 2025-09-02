import { prisma } from './src/lib/database';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...');
    
    // Check users
    const users = await prisma.user.findMany();
    console.log('👥 Users:', users.length);
    
    // Check products
    const products = await prisma.product.findMany();
    console.log('🛍️ Products:', products.length);
    if (products.length > 0) {
      console.log('First product:', products[0]);
    }
    
    // Check carts
    const carts = await prisma.cart.findMany();
    console.log('🛒 Carts:', carts.length);
    
    // Check cart items
    const cartItems = await prisma.cartItem.findMany();
    console.log('📦 Cart items:', cartItems.length);
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
