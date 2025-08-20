import { prisma } from './src/lib/database';

async function createDemoUser() {
  try {
    console.log('🔍 Creating demo user...');
    
    // Get the user ID from localStorage logic (same as ClientProviders)
    const demoUserId = 'demo-user-123'; // Fallback user ID
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: demoUserId }
    });
    
    if (existingUser) {
      console.log('✅ Demo user already exists:', existingUser.email);
      return;
    }
    
    // Create demo user
    const user = await prisma.user.create({
      data: {
        id: demoUserId,
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'hashed_password', // In real app, this would be properly hashed
        role: 'user'
      }
    });
    
    console.log('✅ Demo user created:', user.email);
    
  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
