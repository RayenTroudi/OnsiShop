import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function createDatabaseBackup() {
  try {
    console.log('📦 Creating database backup...');
    
    // Get all data
    const [
      users,
      categories,
      products,
      siteContent,
      navigationItems,
      socialMedia,
      mediaAssets,
      reservations
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.category.findMany(),
      prisma.product.findMany(),
      prisma.siteContent.findMany(),
      prisma.navigationItem.findMany(),
      prisma.socialMedia.findMany(),
      prisma.mediaAsset.findMany(),
      prisma.reservation.findMany()
    ]);

    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        users,
        categories,
        products,
        siteContent,
        navigationItems,
        socialMedia,
        mediaAssets,
        reservations
      }
    };

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    // Save backup file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `database-backup-${timestamp}.json`);
    
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backup created: ${backupFile}`);
    console.log('📊 Backup contents:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🏷️  Categories: ${categories.length}`);
    console.log(`   📦 Products: ${products.length}`);
    console.log(`   📄 Site Content: ${siteContent.length}`);
    console.log(`   🧭 Navigation: ${navigationItems.length}`);
    console.log(`   📱 Social Media: ${socialMedia.length}`);
    console.log(`   🎬 Media Assets: ${mediaAssets.length}`);
    console.log(`   📝 Reservations: ${reservations.length}`);
    
    return backupFile;
    
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createDatabaseBackup().catch(console.error);
}

export default createDatabaseBackup;
