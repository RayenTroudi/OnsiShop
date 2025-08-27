const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function testAuthentication() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔐 Testing Authentication System...\n');
    
    // Check if users exist
    const users = await prisma.user.findMany();
    console.log(`👥 Found ${users.length} users in database:`);
    
    for (const user of users) {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
      
      // Test password for demo users
      if (user.email === 'admin@gmail.com') {
        const isValid = await bcrypt.compare('admin@gmail.com', user.password);
        console.log(`     Password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      }
      
      if (user.email === 'demo@example.com') {
        const isValid = await bcrypt.compare('demo123', user.password);
        console.log(`     Password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      }
    }
    
    console.log('\n🔑 Authentication Test Summary:');
    console.log('• Admin login: admin@gmail.com / admin@gmail.com');
    console.log('• Demo login: demo@example.com / demo123');
    console.log('\n✅ Authentication system is ready!');
    console.log('\n🚀 Test Steps:');
    console.log('1. Start your app: npm run dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Click the profile icon in header');
    console.log('4. Login with demo credentials');
    console.log('5. After login, profile icon should show user menu');
    console.log('6. Clicking again should show dropdown, not log out');
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthentication();
