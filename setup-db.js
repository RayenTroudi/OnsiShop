#!/usr/bin/env node

/**
 * Database Setup Script
 * This script ensures your database is properly configured when opening the project
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkDatabaseExists() {
  const dbPath = path.join(__dirname, 'prisma', 'dev.db');
  return fs.existsSync(dbPath);
}

async function setupDatabase() {
  console.log('🚀 Setting up database for OnsiShop...\n');

  const dbExists = checkDatabaseExists();
  
  if (!dbExists) {
    console.log('📝 Database file not found. Creating new database...');
  } else {
    console.log('📊 Database file found. Updating schema...');
  }

  // Step 1: Generate Prisma Client
  runCommand('npx prisma generate', 'Generating Prisma Client');

  // Step 2: Push schema to database (creates/updates tables)
  runCommand('npx prisma db push', 'Pushing schema to database');

  // Step 3: Seed the database if it's empty or new
  if (!dbExists) {
    console.log('\n📦 New database detected. Seeding with initial data...');
    runCommand('npx prisma db seed', 'Seeding database with initial data');
  } else {
    console.log('\n🔍 Checking if database needs seeding...');
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      const [userCount, productCount, contentCount] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.siteContent.count()
      ]);
      
      if (userCount === 0 || productCount === 0 || contentCount === 0) {
        console.log('📦 Database appears empty. Seeding...');
        runCommand('npx prisma db seed', 'Seeding database with data');
      } else {
        console.log('✅ Database already contains data. Skipping seed.');
      }
      
      await prisma.$disconnect();
    } catch (error) {
      console.log('⚠️ Could not check database content. Running seed to be safe...');
      runCommand('npx prisma db seed', 'Seeding database');
    }
  }

  console.log('\n🎉 Database setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   • Run: npm run dev');
  console.log('   • Visit: http://localhost:3000');
  console.log('   • Admin panel: http://localhost:3000/admin');
  console.log('   • Database studio: npm run db:studio');
}

// Run the setup
setupDatabase().catch((error) => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
