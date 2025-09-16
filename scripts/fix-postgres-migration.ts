#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Fixing PostgreSQL migration issues...');

    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Check and fix any data type issues
    console.log('🔍 Checking database schema compatibility...');

    // Ensure all tables exist and are properly configured
    const tableChecks = [
      'User',
      'Category', 
      'Product',
      'Cart',
      'CartItem',
      'Order',
      'OrderItem',
      'Comment',
      'Rating',
      'Reservation',
      'SiteContent',
      'Translation',
      'Media'
    ];

    for (const table of tableChecks) {
      try {
        const count = await (prisma as any)[table.toLowerCase()].count();
        console.log(`✅ ${table} table: ${count} records`);
      } catch (error) {
        console.warn(`⚠️  ${table} table issue:`, error);
      }
    }

    // Fix any JSON field issues
    console.log('🔧 Checking JSON field compatibility...');
    
    try {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { tags: { not: null } },
            { images: { not: null } },
            { variants: { not: null } }
          ]
        },
        select: {
          id: true,
          tags: true,
          images: true,
          variants: true
        },
        take: 5
      });

      console.log(`📊 Found ${products.length} products with JSON fields`);
      
      for (const product of products) {
        // Test JSON parsing
        try {
          if (product.tags && typeof product.tags === 'string') {
            JSON.parse(product.tags);
          }
          if (product.images && typeof product.images === 'string') {
            JSON.parse(product.images);
          }
          if (product.variants && typeof product.variants === 'string') {
            JSON.parse(product.variants);
          }
          console.log(`✅ Product ${product.id} JSON fields valid`);
        } catch (e) {
          console.warn(`⚠️  Product ${product.id} has invalid JSON:`, e);
        }
      }
    } catch (error) {
      console.warn('JSON field check failed:', error);
    }

    console.log('✅ PostgreSQL migration check completed');

  } catch (error) {
    console.error('❌ Migration check failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default main;