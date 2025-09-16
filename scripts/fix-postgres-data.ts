#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 Fixing PostgreSQL data compatibility issues...');

    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database');

    // Fix JSON fields in products
    console.log('🔍 Checking and fixing Product JSON fields...');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        tags: true,
        images: true,
        variants: true
      }
    });

    console.log(`📊 Found ${products.length} products to check`);

    let fixedCount = 0;
    for (const product of products) {
      let needsUpdate = false;
      const updates: any = {};

      // Fix tags field
      if (product.tags) {
        try {
          if (typeof product.tags === 'string') {
            const parsed = JSON.parse(product.tags);
            if (Array.isArray(parsed)) {
              // Already valid JSON string
            } else {
              updates.tags = JSON.stringify([]);
              needsUpdate = true;
            }
          } else {
            // Not a string, convert to JSON string
            updates.tags = JSON.stringify(Array.isArray(product.tags) ? product.tags : []);
            needsUpdate = true;
          }
        } catch (error) {
          console.warn(`Invalid tags JSON for product ${product.id}, fixing...`);
          updates.tags = JSON.stringify([]);
          needsUpdate = true;
        }
      }

      // Fix images field
      if (product.images) {
        try {
          if (typeof product.images === 'string') {
            const parsed = JSON.parse(product.images);
            if (Array.isArray(parsed)) {
              // Already valid JSON string
            } else {
              updates.images = JSON.stringify([]);
              needsUpdate = true;
            }
          } else {
            // Not a string, convert to JSON string
            updates.images = JSON.stringify(Array.isArray(product.images) ? product.images : []);
            needsUpdate = true;
          }
        } catch (error) {
          console.warn(`Invalid images JSON for product ${product.id}, fixing...`);
          updates.images = JSON.stringify([]);
          needsUpdate = true;
        }
      }

      // Fix variants field
      if (product.variants) {
        try {
          if (typeof product.variants === 'string') {
            const parsed = JSON.parse(product.variants);
            if (Array.isArray(parsed)) {
              // Already valid JSON string
            } else {
              updates.variants = JSON.stringify([]);
              needsUpdate = true;
            }
          } else {
            // Not a string, convert to JSON string
            updates.variants = JSON.stringify(Array.isArray(product.variants) ? product.variants : []);
            needsUpdate = true;
          }
        } catch (error) {
          console.warn(`Invalid variants JSON for product ${product.id}, fixing...`);
          updates.variants = JSON.stringify([]);
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await prisma.product.update({
          where: { id: product.id },
          data: updates
        });
        console.log(`✅ Fixed product: ${product.name} (${product.id})`);
        fixedCount++;
      }
    }

    console.log(`🎉 Fixed ${fixedCount} products with JSON field issues`);

    // Verify database constraints
    console.log('🔍 Checking database constraints...');
    
    try {
      // Test unique constraints
      const duplicateHandles = await prisma.product.groupBy({
        by: ['handle'],
        having: {
          handle: {
            _count: {
              gt: 1
            }
          }
        }
      });

      if (duplicateHandles.length > 0) {
        console.warn(`⚠️  Found ${duplicateHandles.length} products with duplicate handles`);
        for (const duplicate of duplicateHandles) {
          const products = await prisma.product.findMany({
            where: { handle: duplicate.handle },
            select: { id: true, name: true, handle: true }
          });
          
          // Fix duplicates by appending timestamp
          for (let i = 1; i < products.length; i++) {
            const newHandle = `${products[i].handle}-${Date.now()}-${i}`;
            await prisma.product.update({
              where: { id: products[i].id },
              data: { handle: newHandle }
            });
            console.log(`✅ Fixed duplicate handle: ${products[i].handle} -> ${newHandle}`);
          }
        }
      } else {
        console.log('✅ No duplicate product handles found');
      }

      // Test category constraints
      const duplicateCategoryHandles = await prisma.category.groupBy({
        by: ['handle'],
        having: {
          handle: {
            _count: {
              gt: 1
            }
          }
        }
      });

      if (duplicateCategoryHandles.length > 0) {
        console.warn(`⚠️  Found ${duplicateCategoryHandles.length} categories with duplicate handles`);
        // Fix category duplicates similarly
      } else {
        console.log('✅ No duplicate category handles found');
      }

    } catch (error) {
      console.warn('Constraint check failed:', error);
    }

    console.log('✅ PostgreSQL data compatibility fix completed!');

  } catch (error) {
    console.error('❌ Failed to fix PostgreSQL compatibility:', error);
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