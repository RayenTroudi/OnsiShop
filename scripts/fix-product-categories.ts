import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProductCategories() {
  try {
    console.log('🔧 Fixing product category assignments...');

    // Get categories
    const clothing = await prisma.category.findUnique({ where: { handle: 'clothing' } });
    const accessories = await prisma.category.findUnique({ where: { handle: 'accessories' } });
    const shoes = await prisma.category.findUnique({ where: { handle: 'shoes' } });

    // If clothing category doesn't exist, let's create it
    let clothingCategory = clothing;
    if (!clothingCategory) {
      clothingCategory = await prisma.category.create({
        data: {
          name: 'Clothing',
          handle: 'clothing',
          description: 'All clothing items including shirts, pants, hoodies, etc.'
        }
      });
      console.log('✅ Created Clothing category');
    }

    // If accessories category doesn't exist, let's create it
    let accessoriesCategory = accessories;
    if (!accessoriesCategory) {
      accessoriesCategory = await prisma.category.create({
        data: {
          name: 'Accessories',
          handle: 'accessories', 
          description: 'Watches, jewelry, and other accessories'
        }
      });
      console.log('✅ Created Accessories category');
    }

    // Update products without categories
    const productsToUpdate = [
      { handle: 'cotton-hoodie-comfortable', categoryId: clothingCategory.id },
      { handle: 'casual-shorts-summer', categoryId: clothingCategory.id },
      { handle: 'formal-blazer-business', categoryId: clothingCategory.id },
      { handle: 'watch-minimal-silver', categoryId: accessoriesCategory?.id },
      { handle: 'cardigan-wool-cozy', categoryId: clothingCategory.id }
    ];

    for (const update of productsToUpdate) {
      const product = await prisma.product.findUnique({
        where: { handle: update.handle }
      });

      if (product && !product.categoryId) {
        await prisma.product.update({
          where: { handle: update.handle },
          data: { categoryId: update.categoryId }
        });
        console.log(`✅ Updated ${product.title} category`);
      }
    }

    console.log('🎉 Product categories fixed!');

    // Show updated summary
    const products = await prisma.product.findMany({ include: { category: true } });
    console.log('\n📊 Products summary:');
    products.forEach(p => {
      const categoryName = p.category ? p.category.name : 'No Category';
      console.log(`   - ${p.title} [${categoryName}]`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductCategories();
