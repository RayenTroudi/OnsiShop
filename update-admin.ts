import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateAdminUser() {
  console.log('🔄 Updating admin user...');

  // Delete all existing users
  await prisma.user.deleteMany({});
  console.log('✅ Deleted all existing users');

  // Create new admin user
  const hashedPassword = await bcrypt.hash('admin@gmail.com', 12);
  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin',
    },
  });
  console.log('✅ Created new admin user (email: admin@gmail.com, password: admin@gmail.com)');
}

updateAdminUser()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
