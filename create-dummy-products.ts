import { prisma } from './src/lib/database';

async function createDummyProducts() {
  try {
    console.log('🚀 Creating dummy products...');

    // Sample product data
    const products = [
      {
        handle: 'summer-dress-floral',
        title: 'Summer Floral Dress',
        description: 'Beautiful floral summer dress perfect for warm weather. Made with lightweight, breathable fabric.',
        price: 89.99,
        compareAtPrice: 129.99,
        availableForSale: true,
        tags: JSON.stringify(['summer', 'dress', 'floral', 'casual']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'dress-1-small',
            title: 'Small',
            price: 89.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: 'Small' }]
          },
          {
            id: 'dress-1-medium',
            title: 'Medium', 
            price: 89.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: 'Medium' }]
          },
          {
            id: 'dress-1-large',
            title: 'Large',
            price: 89.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: 'Large' }]
          }
        ])
      },
      {
        handle: 'denim-jeans-classic',
        title: 'Classic Denim Jeans',
        description: 'Premium quality denim jeans with a classic fit. Durable and comfortable for everyday wear.',
        price: 79.99,
        compareAtPrice: 99.99,
        availableForSale: true,
        tags: JSON.stringify(['jeans', 'denim', 'casual', 'classic']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'jeans-1-28',
            title: '28',
            price: 79.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: '28' }]
          },
          {
            id: 'jeans-1-30',
            title: '30',
            price: 79.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: '30' }]
          },
          {
            id: 'jeans-1-32',
            title: '32',
            price: 79.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: '32' }]
          }
        ])
      },
      {
        handle: 'cotton-t-shirt-basic',
        title: 'Basic Cotton T-Shirt',
        description: 'Soft and comfortable 100% cotton t-shirt. Perfect for layering or wearing on its own.',
        price: 24.99,
        compareAtPrice: 34.99,
        availableForSale: true,
        tags: JSON.stringify(['t-shirt', 'cotton', 'basic', 'casual']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'tshirt-1-small-white',
            title: 'Small / White',
            price: 24.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Small' },
              { name: 'Color', value: 'White' }
            ]
          },
          {
            id: 'tshirt-1-medium-white',
            title: 'Medium / White',
            price: 24.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Medium' },
              { name: 'Color', value: 'White' }
            ]
          },
          {
            id: 'tshirt-1-small-black',
            title: 'Small / Black',
            price: 24.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Small' },
              { name: 'Color', value: 'Black' }
            ]
          }
        ])
      },
      {
        handle: 'running-shoes-sport',
        title: 'Sport Running Shoes',
        description: 'Lightweight running shoes with excellent cushioning and support. Perfect for jogging and gym workouts.',
        price: 129.99,
        compareAtPrice: 159.99,
        availableForSale: true,
        tags: JSON.stringify(['shoes', 'running', 'sport', 'athletic']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'shoes-1-8',
            title: 'Size 8',
            price: 129.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: '8' }]
          },
          {
            id: 'shoes-1-9',
            title: 'Size 9',
            price: 129.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: '9' }]
          },
          {
            id: 'shoes-1-10',
            title: 'Size 10',
            price: 129.99,
            availableForSale: false,
            selectedOptions: [{ name: 'Size', value: '10' }]
          }
        ])
      },
      {
        handle: 'leather-handbag-classic',
        title: 'Classic Leather Handbag',
        description: 'Elegant leather handbag with multiple compartments. Perfect for work or special occasions.',
        price: 199.99,
        compareAtPrice: 249.99,
        availableForSale: true,
        tags: JSON.stringify(['handbag', 'leather', 'accessories', 'elegant']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'bag-1-black',
            title: 'Black',
            price: 199.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Color', value: 'Black' }]
          },
          {
            id: 'bag-1-brown',
            title: 'Brown',
            price: 199.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Color', value: 'Brown' }]
          }
        ])
      },
      {
        handle: 'sunglasses-aviator',
        title: 'Aviator Sunglasses',
        description: 'Classic aviator sunglasses with UV protection. Timeless style that suits any face shape.',
        price: 59.99,
        compareAtPrice: 79.99,
        availableForSale: true,
        tags: JSON.stringify(['sunglasses', 'aviator', 'accessories', 'UV protection']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'sunglasses-1-gold',
            title: 'Gold Frame',
            price: 59.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Frame', value: 'Gold' }]
          },
          {
            id: 'sunglasses-1-silver',
            title: 'Silver Frame',
            price: 59.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Frame', value: 'Silver' }]
          }
        ])
      },
      {
        handle: 'winter-jacket-warm',
        title: 'Warm Winter Jacket',
        description: 'Insulated winter jacket that keeps you warm in cold weather. Water-resistant and windproof.',
        price: 159.99,
        compareAtPrice: 199.99,
        availableForSale: true,
        tags: JSON.stringify(['jacket', 'winter', 'warm', 'outerwear']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'jacket-1-small-navy',
            title: 'Small / Navy',
            price: 159.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Small' },
              { name: 'Color', value: 'Navy' }
            ]
          },
          {
            id: 'jacket-1-medium-navy',
            title: 'Medium / Navy',
            price: 159.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Medium' },
              { name: 'Color', value: 'Navy' }
            ]
          },
          {
            id: 'jacket-1-large-black',
            title: 'Large / Black',
            price: 159.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Large' },
              { name: 'Color', value: 'Black' }
            ]
          }
        ])
      },
      {
        handle: 'silk-scarf-elegant',
        title: 'Elegant Silk Scarf',
        description: 'Luxurious silk scarf with beautiful patterns. Adds elegance to any outfit.',
        price: 49.99,
        compareAtPrice: 69.99,
        availableForSale: true,
        tags: JSON.stringify(['scarf', 'silk', 'accessories', 'elegant']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'scarf-1-floral',
            title: 'Floral Pattern',
            price: 49.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Pattern', value: 'Floral' }]
          },
          {
            id: 'scarf-1-geometric',
            title: 'Geometric Pattern',
            price: 49.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Pattern', value: 'Geometric' }]
          }
        ])
      }
    ];

    // Get category IDs
    const dressesCategory = await prisma.category.findUnique({ where: { handle: 'dresses' } });
    const jeansCategory = await prisma.category.findUnique({ where: { handle: 'jeans' } });
    const tshirtsCategory = await prisma.category.findUnique({ where: { handle: 't-shirts' } });
    const shoesCategory = await prisma.category.findUnique({ where: { handle: 'shoes' } });
    const bagsCategory = await prisma.category.findUnique({ where: { handle: 'bags' } });
    const accessoriesCategory = await prisma.category.findUnique({ where: { handle: 'accessories' } });
    const clothingCategory = await prisma.category.findUnique({ where: { handle: 'clothing' } });

    // Create products with category assignments
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      if (!product) continue;
      
      let categoryId: string | undefined;
      
      // Assign category based on product index
      switch (i) {
        case 0: categoryId = dressesCategory?.id; break;        // Summer Dress
        case 1: categoryId = jeansCategory?.id; break;          // Denim Jeans  
        case 2: categoryId = tshirtsCategory?.id; break;        // Cotton T-Shirt
        case 3: categoryId = shoesCategory?.id; break;          // Running Shoes
        case 4: categoryId = bagsCategory?.id; break;           // Leather Handbag
        case 5: categoryId = accessoriesCategory?.id; break;    // Sunglasses
        case 6: categoryId = clothingCategory?.id; break;       // Winter Jacket
        case 7: categoryId = accessoriesCategory?.id; break;    // Silk Scarf
        default: categoryId = undefined;
      }
      
      const existingProduct = await prisma.product.findUnique({
        where: { handle: product.handle }
      });

      if (!existingProduct) {
        await prisma.product.create({
          data: {
            handle: product.handle,
            title: product.title,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            availableForSale: product.availableForSale,
            categoryId: categoryId,
            tags: product.tags,
            images: product.images,
            variants: product.variants
          }
        });
        console.log(`✅ Created product: ${product.title}`);
      } else {
        console.log(`⚠️  Product already exists: ${product.title}`);
      }
    }

    console.log('🎉 Dummy products creation completed!');
    
    // Show summary
    const totalProducts = await prisma.product.count();
    console.log(`📊 Total products in database: ${totalProducts}`);

  } catch (error) {
    console.error('❌ Error creating dummy products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDummyProducts();
