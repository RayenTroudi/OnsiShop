import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function restoreDatabaseBackup(backupFile?: string) {
  try {
    console.log('🔄 Restoring database from backup...');
    
    // Find the latest backup if no specific file provided
    if (!backupFile) {
      const backupDir = path.join(process.cwd(), 'backups');
      if (!fs.existsSync(backupDir)) {
        throw new Error('No backup directory found');
      }
      
      const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('database-backup-') && file.endsWith('.json'))
        .sort()
        .reverse();
        
      if (backupFiles.length === 0) {
        throw new Error('No backup files found');
      }
      
      const latestBackup = backupFiles[0]!; // Non-null assertion since we checked length
      backupFile = path.join(backupDir, latestBackup);
      console.log(`📁 Using latest backup: ${latestBackup}`);
    }
    
    // Read backup
    const backupData = JSON.parse(fs.readFileSync(backupFile!, 'utf8'));
    
    console.log(`📅 Backup from: ${backupData.timestamp}`);
    console.log('🧹 Clearing existing data...');
    
    // Clear existing data in correct order (respecting foreign key constraints)
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.siteContent.deleteMany();
    await prisma.navigationItem.deleteMany();
    await prisma.socialMedia.deleteMany();
    await prisma.mediaAsset.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('📥 Restoring data...');
    
    // Restore data in correct order
    const { data } = backupData;
    
    // Users first
    if (data.users) {
      for (const user of data.users) {
        await prisma.user.create({ data: user });
      }
      console.log(`✅ Restored ${data.users.length} users`);
    }
    
    // Categories
    if (data.categories) {
      for (const category of data.categories) {
        await prisma.category.create({ data: category });
      }
      console.log(`✅ Restored ${data.categories.length} categories`);
    }
    
    // Products
    if (data.products) {
      for (const product of data.products) {
        await prisma.product.create({ data: product });
      }
      console.log(`✅ Restored ${data.products.length} products`);
    }
    
    // Site content
    if (data.siteContent) {
      for (const content of data.siteContent) {
        await prisma.siteContent.create({ data: content });
      }
      console.log(`✅ Restored ${data.siteContent.length} site content items`);
    }
    
    // Navigation
    if (data.navigationItems) {
      for (const nav of data.navigationItems) {
        await prisma.navigationItem.create({ data: nav });
      }
      console.log(`✅ Restored ${data.navigationItems.length} navigation items`);
    }
    
    // Social media
    if (data.socialMedia) {
      for (const social of data.socialMedia) {
        await prisma.socialMedia.create({ data: social });
      }
      console.log(`✅ Restored ${data.socialMedia.length} social media items`);
    }
    
    // Media assets
    if (data.mediaAssets) {
      for (const asset of data.mediaAssets) {
        await prisma.mediaAsset.create({ data: asset });
      }
      console.log(`✅ Restored ${data.mediaAssets.length} media assets`);
    }
    
    console.log('🎉 Database restored successfully!');
    
  } catch (error) {
    console.error('❌ Error restoring backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  const backupFile = process.argv[2]; // Optional backup file path
  restoreDatabaseBackup(backupFile).catch(console.error);
}

export default restoreDatabaseBackup;
