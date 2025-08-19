import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Delete old admin user if exists
  await prisma.user.deleteMany({
    where: { email: 'admin' },
  });

  // Create default admin user
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@gmail.com' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin@gmail.com', 12);
    await prisma.user.create({
      data: {
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'Administrator',
        role: 'admin',
      },
    });
    console.log('✅ Default admin user created (email: admin@gmail.com, password: admin@gmail.com)');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // Create categories
  const clothingCategory = await prisma.category.create({
    data: {
      name: 'Clothing',
      handle: 'clothing',
      description: 'All clothing items including shirts, pants, jackets, and more.',
    },
  });

  const accessoriesCategory = await prisma.category.create({
    data: {
      name: 'Accessories',
      handle: 'accessories',
      description: 'Fashion accessories including bags, jewelry, hats, and more.',
    },
  });

  console.log('✅ Categories created');

  // Create sample products
  const product1 = await prisma.product.create({
    data: {
      handle: 'classic-white-t-shirt',
      title: 'Classic White T-Shirt',
      description: 'A comfortable and versatile white t-shirt made from 100% cotton. Perfect for casual wear or layering.',
      price: 29.99,
      compareAtPrice: 39.99,
      availableForSale: true,
      categoryId: clothingCategory.id,
      tags: JSON.stringify(['cotton', 'casual', 'white', 'comfortable']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=400&fit=crop'
      ]),
      variants: JSON.stringify([
        {
          id: 'variant_white_s',
          title: 'Small / White',
          price: 29.99,
          availableForSale: true,
          selectedOptions: [
            { name: 'Size', value: 'Small' },
            { name: 'Color', value: 'White' }
          ]
        },
        {
          id: 'variant_white_m',
          title: 'Medium / White',
          price: 29.99,
          availableForSale: true,
          selectedOptions: [
            { name: 'Size', value: 'Medium' },
            { name: 'Color', value: 'White' }
          ]
        },
        {
          id: 'variant_white_l',
          title: 'Large / White',
          price: 29.99,
          availableForSale: true,
          selectedOptions: [
            { name: 'Size', value: 'Large' },
            { name: 'Color', value: 'White' }
          ]
        }
      ]),
    },
  });

  const product2 = await prisma.product.create({
    data: {
      handle: 'denim-jacket',
      title: 'Classic Denim Jacket',
      description: 'A timeless denim jacket that never goes out of style. Made from premium denim with a comfortable fit.',
      price: 89.99,
      compareAtPrice: 119.99,
      availableForSale: true,
      categoryId: clothingCategory.id,
      tags: JSON.stringify(['denim', 'jacket', 'classic', 'blue']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'
      ]),
      variants: JSON.stringify([
        {
          id: 'variant_denim_s',
          title: 'Small / Blue',
          price: 89.99,
          availableForSale: true,
          selectedOptions: [
            { name: 'Size', value: 'Small' },
            { name: 'Color', value: 'Blue' }
          ]
        },
        {
          id: 'variant_denim_m',
          title: 'Medium / Blue',
          price: 89.99,
          availableForSale: true,
          selectedOptions: [
            { name: 'Size', value: 'Medium' },
            { name: 'Color', value: 'Blue' }
          ]
        },
        {
          id: 'variant_denim_l',
          title: 'Large / Blue',
          price: 89.99,
          availableForSale: true,
          selectedOptions: [
            { name: 'Size', value: 'Large' },
            { name: 'Color', value: 'Blue' }
          ]
        }
      ]),
    },
  });

  const product3 = await prisma.product.create({
    data: {
      handle: 'leather-handbag',
      title: 'Leather Handbag',
      description: 'Elegant leather handbag perfect for everyday use. Features multiple compartments and a timeless design.',
      price: 149.99,
      compareAtPrice: 199.99,
      availableForSale: true,
      categoryId: accessoriesCategory.id,
      tags: JSON.stringify(['leather', 'handbag', 'accessories', 'brown']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop'
      ]),
      variants: JSON.stringify([
        {
          id: 'variant_bag_brown',
          title: 'Brown',
          price: 149.99,
          availableForSale: true,
          selectedOptions: [
            { name: 'Color', value: 'Brown' }
          ]
        },
        {
          id: 'variant_bag_black',
          title: 'Black',
          price: 149.99,
          availableForSale: true,
          selectedOptions: [
            { name: 'Color', value: 'Black' }
          ]
        }
      ]),
    },
  });

  console.log('✅ Products created');
  console.log('🌱 Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
