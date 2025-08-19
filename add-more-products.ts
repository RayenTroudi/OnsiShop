import { prisma } from './src/lib/database';

async function addMoreProducts() {
  try {
    console.log('🚀 Adding more dummy products...');

    // Additional product data
    const moreProducts = [
      {
        handle: 'cotton-hoodie-comfortable',
        title: 'Comfortable Cotton Hoodie',
        description: 'Soft and cozy cotton hoodie perfect for casual wear. Available in multiple colors.',
        price: 65.99,
        compareAtPrice: 89.99,
        availableForSale: true,
        tags: JSON.stringify(['hoodie', 'cotton', 'casual', 'comfort']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'hoodie-1-small-gray',
            title: 'Small / Gray',
            price: 65.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Small' },
              { name: 'Color', value: 'Gray' }
            ]
          },
          {
            id: 'hoodie-1-medium-gray',
            title: 'Medium / Gray',
            price: 65.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Medium' },
              { name: 'Color', value: 'Gray' }
            ]
          },
          {
            id: 'hoodie-1-large-black',
            title: 'Large / Black',
            price: 65.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Large' },
              { name: 'Color', value: 'Black' }
            ]
          }
        ])
      },
      {
        handle: 'casual-shorts-summer',
        title: 'Summer Casual Shorts',
        description: 'Lightweight and breathable shorts perfect for hot summer days. Comfortable fit with multiple pockets.',
        price: 39.99,
        compareAtPrice: 49.99,
        availableForSale: true,
        tags: JSON.stringify(['shorts', 'summer', 'casual', 'lightweight']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'shorts-1-30-khaki',
            title: '30 / Khaki',
            price: 39.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: '30' },
              { name: 'Color', value: 'Khaki' }
            ]
          },
          {
            id: 'shorts-1-32-khaki',
            title: '32 / Khaki',
            price: 39.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: '32' },
              { name: 'Color', value: 'Khaki' }
            ]
          },
          {
            id: 'shorts-1-34-navy',
            title: '34 / Navy',
            price: 39.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: '34' },
              { name: 'Color', value: 'Navy' }
            ]
          }
        ])
      },
      {
        handle: 'formal-blazer-business',
        title: 'Business Formal Blazer',
        description: 'Professional blazer perfect for business meetings and formal occasions. Tailored fit with premium fabric.',
        price: 189.99,
        compareAtPrice: 229.99,
        availableForSale: true,
        tags: JSON.stringify(['blazer', 'formal', 'business', 'professional']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'blazer-1-small-charcoal',
            title: 'Small / Charcoal',
            price: 189.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Small' },
              { name: 'Color', value: 'Charcoal' }
            ]
          },
          {
            id: 'blazer-1-medium-charcoal',
            title: 'Medium / Charcoal',
            price: 189.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Medium' },
              { name: 'Color', value: 'Charcoal' }
            ]
          },
          {
            id: 'blazer-1-large-navy',
            title: 'Large / Navy',
            price: 189.99,
            availableForSale: false,
            selectedOptions: [
              { name: 'Size', value: 'Large' },
              { name: 'Color', value: 'Navy' }
            ]
          }
        ])
      },
      {
        handle: 'sneakers-white-classic',
        title: 'Classic White Sneakers',
        description: 'Timeless white sneakers that go with everything. Comfortable and durable for everyday wear.',
        price: 89.99,
        compareAtPrice: 119.99,
        availableForSale: true,
        tags: JSON.stringify(['sneakers', 'white', 'classic', 'casual']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'sneakers-1-7-white',
            title: 'Size 7',
            price: 89.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: '7' }]
          },
          {
            id: 'sneakers-1-8-white',
            title: 'Size 8',
            price: 89.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: '8' }]
          },
          {
            id: 'sneakers-1-9-white',
            title: 'Size 9',
            price: 89.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: '9' }]
          },
          {
            id: 'sneakers-1-10-white',
            title: 'Size 10',
            price: 89.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Size', value: '10' }]
          }
        ])
      },
      {
        handle: 'watch-minimal-silver',
        title: 'Minimal Silver Watch',
        description: 'Elegant minimalist watch with silver band. Perfect for both casual and formal occasions.',
        price: 149.99,
        compareAtPrice: 199.99,
        availableForSale: true,
        tags: JSON.stringify(['watch', 'silver', 'minimal', 'accessories']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'watch-1-silver',
            title: 'Silver',
            price: 149.99,
            availableForSale: true,
            selectedOptions: [{ name: 'Color', value: 'Silver' }]
          }
        ])
      },
      {
        handle: 'cardigan-wool-cozy',
        title: 'Cozy Wool Cardigan',
        description: 'Warm and comfortable wool cardigan perfect for layering. Soft texture with button-up front.',
        price: 79.99,
        compareAtPrice: 99.99,
        availableForSale: true,
        tags: JSON.stringify(['cardigan', 'wool', 'cozy', 'layering']),
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'
        ]),
        variants: JSON.stringify([
          {
            id: 'cardigan-1-small-cream',
            title: 'Small / Cream',
            price: 79.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Small' },
              { name: 'Color', value: 'Cream' }
            ]
          },
          {
            id: 'cardigan-1-medium-cream',
            title: 'Medium / Cream',
            price: 79.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Medium' },
              { name: 'Color', value: 'Cream' }
            ]
          },
          {
            id: 'cardigan-1-large-beige',
            title: 'Large / Beige',
            price: 79.99,
            availableForSale: true,
            selectedOptions: [
              { name: 'Size', value: 'Large' },
              { name: 'Color', value: 'Beige' }
            ]
          }
        ])
      }
    ];

    // Get category IDs for assignment
    const clothingCategory = await prisma.category.findUnique({ where: { handle: 'clothing' } });
    const shoesCategory = await prisma.category.findUnique({ where: { handle: 'shoes' } });
    const accessoriesCategory = await prisma.category.findUnique({ where: { handle: 'accessories' } });
    const newArrivalsCategory = await prisma.category.findUnique({ where: { handle: 'new-arrivals' } });

    // Create products with category assignments
    for (let i = 0; i < moreProducts.length; i++) {
      const product = moreProducts[i];
      
      if (!product) continue;
      
      let categoryId: string | undefined;
      
      // Assign category based on product type
      switch (i) {
        case 0: categoryId = clothingCategory?.id; break;        // Hoodie
        case 1: categoryId = clothingCategory?.id; break;        // Shorts
        case 2: categoryId = clothingCategory?.id; break;        // Blazer
        case 3: categoryId = shoesCategory?.id; break;           // Sneakers
        case 4: categoryId = accessoriesCategory?.id; break;     // Watch
        case 5: categoryId = clothingCategory?.id; break;        // Cardigan
        default: categoryId = newArrivalsCategory?.id;
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

    console.log('🎉 Additional products creation completed!');
    
    // Show summary
    const totalProducts = await prisma.product.count();
    console.log(`📊 Total products in database: ${totalProducts}`);

  } catch (error) {
    console.error('❌ Error creating additional products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMoreProducts();
