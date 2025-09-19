import bcrypt from 'bcryptjs';
import { dbService } from '../src/lib/database';

async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding...');

    // Check if users already exist
    const adminUser = await dbService.getUserByEmail('admin@onsishop.com');
    const normalUser = await dbService.getUserByEmail('user@onsishop.com');

    if (adminUser && normalUser) {
      console.log('✅ Users already exist - seeding skipped');
      console.log(`Admin: ${adminUser.email} (ID: ${adminUser.id})`);
      console.log(`User: ${normalUser.email} (ID: ${normalUser.id})`);
      return;
    }

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const userPassword = await bcrypt.hash('user123', 12);

    // Create admin user if doesn't exist
    if (!adminUser) {
      const createdAdmin = await dbService.createUser({
        email: 'admin@onsishop.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Admin user created:', {
        id: createdAdmin.id,
        email: createdAdmin.email,
        name: createdAdmin.name,
        role: createdAdmin.role
      });
    } else {
      console.log('ℹ️ Admin user already exists:', adminUser.email);
    }

    // Create normal user if doesn't exist
    if (!normalUser) {
      const createdUser = await dbService.createUser({
        email: 'user@onsishop.com',
        password: userPassword,
        name: 'Regular User',
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Normal user created:', {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
        role: createdUser.role
      });
    } else {
      console.log('ℹ️ Normal user already exists:', normalUser.email);
    }

    console.log('\n🎉 User seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('👑 Admin User:');
    console.log('   Email: admin@onsishop.com');
    console.log('   Password: admin123');
    console.log('\n👤 Normal User:');
    console.log('   Email: user@onsishop.com');
    console.log('   Password: user123');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding process failed:', error);
      process.exit(1);
    });
}

export { seedUsers };
