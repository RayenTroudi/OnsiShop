#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database for Railway deployment...');

    // Ensure database file exists and is writable
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db';
    const dbDir = path.dirname(dbPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`📁 Created database directory: ${dbDir}`);
    }

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Check if database has tables
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%';
    ` as any[];

    if (tables.length === 0) {
      console.log('📊 No tables found, running database setup...');
      
      // Push database schema
      const { spawn } = require('child_process');
      
      const pushProcess = spawn('npx', ['prisma', 'db', 'push'], {
        stdio: 'inherit',
        shell: true
      });

      await new Promise((resolve, reject) => {
        pushProcess.on('close', (code: number) => {
          if (code === 0) {
            console.log('✅ Database schema pushed successfully');
            resolve(code);
          } else {
            reject(new Error(`Database push failed with code ${code}`));
          }
        });
      });

      // Run seed
      const seedProcess = spawn('npx', ['prisma', 'db', 'seed'], {
        stdio: 'inherit',
        shell: true
      });

      await new Promise((resolve, reject) => {
        seedProcess.on('close', (code: number) => {
          if (code === 0) {
            console.log('✅ Database seeded successfully');
            resolve(code);
          } else {
            console.log('⚠️ Database seeding failed, but continuing...');
            resolve(code); // Don't fail deployment if seeding fails
          }
        });
      });
    } else {
      console.log(`✅ Database already initialized with ${tables.length} tables`);
    }

    // Verify essential data exists
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const siteContentCount = await prisma.siteContent.count();
    const translationCount = await prisma.translation.count();

    console.log(`📊 Database status:`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Content entries: ${siteContentCount}`);
    console.log(`   - Translations: ${translationCount}`);

    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default initializeDatabase;