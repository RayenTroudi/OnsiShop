const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedCategoriesAndProducts() {
  console.log('🌱 Seeding categories and products to fix navigation...');
  
  try {
    // Create categories that match mock menu handles
    const categories = [
      {
        name: 'Best Sellers',
        handle: 'best-sellers',
        description: 'Our most popular and best-selling items'
      },
      {
        name: 'New Arrivals', 
        handle: 'new-arrivals',
        description: 'Latest products and newest additions to our collection'
      },
      {
        name: 'Clothing',
        handle: 'clothing', 
        description: 'Stylish clothing for all occasions'
      },
      {
        name: 'Accessories',
        handle: 'accessories',
        description: 'Perfect accessories to complete your look'
      }
    ];
    
    console.log('\n📂 Creating categories...');
    const createdCategories = {};
    
    for (const category of categories) {
      const existing = await prisma.category.findUnique({
        where: { handle: category.handle }
      });
      
      if (existing) {
        console.log(`✅ Category "${category.name}" already exists`);
        createdCategories[category.handle] = existing;
      } else {
        const created = await prisma.category.create({
          data: category
        });
        console.log(`✅ Created category "${category.name}" with handle "${category.handle}"`);
        createdCategories[category.handle] = created;
      }
    }
    
    // Create sample products for each category
    console.log('\n📦 Creating sample products...');
    
    const sampleProducts = [
      // Best Sellers
      {
        name: 'Premium Cotton T-Shirt',
        handle: 'premium-cotton-tshirt',
        title: 'Premium Cotton T-Shirt',
        description: 'Comfortable and stylish premium cotton t-shirt',
        price: 29.99,
        stock: 50,
        categoryHandle: 'best-sellers',
        tags: 'bestseller,cotton,comfortable'
      },
      {
        name: 'Classic Denim Jeans',
        handle: 'classic-denim-jeans',
        title: 'Classic Denim Jeans',
        description: 'Timeless denim jeans with perfect fit',
        price: 79.99,
        stock: 30,
        categoryHandle: 'best-sellers',
        tags: 'bestseller,denim,classic'
      },
      
      // New Arrivals
      {
        name: 'Summer Floral Dress',
        handle: 'summer-floral-dress',
        title: 'Summer Floral Dress',
        description: 'Beautiful floral dress perfect for summer',
        price: 89.99,
        stock: 25,
        categoryHandle: 'new-arrivals',
        tags: 'new,summer,floral,dress'
      },
      {
        name: 'Trendy Sneakers',
        handle: 'trendy-sneakers',
        title: 'Trendy Sneakers',
        description: 'Latest trendy sneakers for everyday wear',
        price: 99.99,
        stock: 40,
        categoryHandle: 'new-arrivals',
        tags: 'new,sneakers,trendy,shoes'
      },
      
      // Clothing
      {
        name: 'Casual Button Shirt',
        handle: 'casual-button-shirt',
        title: 'Casual Button Shirt',
        description: 'Versatile casual button-up shirt',
        price: 49.99,
        stock: 35,
        categoryHandle: 'clothing',
        tags: 'clothing,shirt,casual,button'
      },
      {
        name: 'Cozy Sweater',
        handle: 'cozy-sweater',
        title: 'Cozy Sweater',
        description: 'Warm and cozy sweater for cool weather',
        price: 69.99,
        stock: 20,
        categoryHandle: 'clothing',
        tags: 'clothing,sweater,cozy,warm'
      },
      
      // Accessories
      {
        name: 'Leather Wallet',
        handle: 'leather-wallet',
        title: 'Leather Wallet',
        description: 'Premium leather wallet with multiple compartments',
        price: 39.99,
        stock: 45,
        categoryHandle: 'accessories',
        tags: 'accessories,wallet,leather,premium'
      },
      {
        name: 'Stylish Sunglasses',
        handle: 'stylish-sunglasses',
        title: 'Stylish Sunglasses',
        description: 'Fashionable sunglasses with UV protection',
        price: 59.99,
        stock: 30,
        categoryHandle: 'accessories',
        tags: 'accessories,sunglasses,stylish,uv'
      }
    ];
    
    for (const product of sampleProducts) {
      const category = createdCategories[product.categoryHandle];
      if (!category) {
        console.log(`❌ Category ${product.categoryHandle} not found for product ${product.name}`);
        continue;
      }
      
      const existing = await prisma.product.findUnique({
        where: { handle: product.handle }
      });
      
      if (existing) {
        console.log(`✅ Product "${product.name}" already exists`);
      } else {
        await prisma.product.create({
          data: {
            name: product.name,
            handle: product.handle,
            title: product.title,
            description: product.description,
            price: product.price,
            stock: product.stock,
            categoryId: category.id,
            tags: product.tags,
            availableForSale: true
          }
        });
        console.log(`✅ Created product "${product.name}" in category "${category.name}"`);
      }
    }
    
    // Verify the results
    console.log('\n📊 Final verification:');
    const finalCategories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    finalCategories.forEach(cat => {
      console.log(`  • ${cat.name} (${cat.handle}): ${cat._count.products} products`);
    });
    
    const totalProducts = await prisma.product.count();
    console.log(`\n🎉 Database now has ${finalCategories.length} categories and ${totalProducts} products!`);
    
    console.log('\n💡 Navigation should now work:');
    console.log('• Click "Best Sellers" → /search/best-sellers → Shows products');
    console.log('• Click "New Arrivals" → /search/new-arrivals → Shows products');
    console.log('• Click "Clothing" → /search/clothing → Shows products');
    console.log('• Click "Accessories" → /search/accessories → Shows products');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategoriesAndProducts();
