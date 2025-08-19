import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMissingCategoriesAndProducts() {
  console.log('Adding missing categories and products...');

  // Check if bags category exists, if not create it
  let bagsCategory = await prisma.category.findUnique({
    where: { handle: 'bags' }
  });

  if (!bagsCategory) {
    bagsCategory = await prisma.category.create({
      data: {
        name: 'Bags',
        handle: 'bags',
        description: 'Handbags, backpacks, and other bags.',
      },
    });
    console.log('✅ Bags category created');
  }

  // Check if shoes category exists, if not create it
  let shoesCategory = await prisma.category.findUnique({
    where: { handle: 'shoes' }
  });

  if (!shoesCategory) {
    shoesCategory = await prisma.category.create({
      data: {
        name: 'Shoes',
        handle: 'shoes',
        description: 'Sneakers, boots, sandals, and other footwear.',
      },
    });
    console.log('✅ Shoes category created');
  }

  // Add some bag products
  const existingBagProducts = await prisma.product.findMany({
    where: { categoryId: bagsCategory.id }
  });

  if (existingBagProducts.length === 0) {
    await prisma.product.create({
      data: {
        handle: 'canvas-backpack',
        title: 'Canvas Backpack',
        description: 'Durable canvas backpack perfect for daily use or travel.',
        price: 79.99,
        compareAtPrice: 99.99,
        availableForSale: true,
        categoryId: bagsCategory.id,
        tags: JSON.stringify(['backpack', 'canvas', 'travel', 'casual']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'variant_backpack_beige',
            title: 'Beige',
            price: 79.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Color', value: 'Beige' }
            ]
          }
        ]),
      },
    });
    console.log('✅ Canvas Backpack added');
  }

  // Add some shoe products
  const existingShoeProducts = await prisma.product.findMany({
    where: { categoryId: shoesCategory.id }
  });

  if (existingShoeProducts.length === 0) {
    await prisma.product.create({
      data: {
        handle: 'white-sneakers',
        title: 'White Sneakers',
        description: 'Classic white sneakers that go with everything.',
        price: 129.99,
        compareAtPrice: 159.99,
        availableForSale: true,
        categoryId: shoesCategory.id,
        tags: JSON.stringify(['sneakers', 'white', 'casual', 'comfortable']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'variant_sneakers_8',
            title: 'Size 8',
            price: 129.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: '8' },
              { name: 'Color', value: 'White' }
            ]
          },
          {
            id: 'variant_sneakers_9',
            title: 'Size 9',
            price: 129.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: '9' },
              { name: 'Color', value: 'White' }
            ]
          }
        ]),
      },
    });
    console.log('✅ White Sneakers added');
  }

  console.log('🎉 All categories and products are ready!');
}

addMissingCategoriesAndProducts()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
