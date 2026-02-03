/**
 * Import sample/demo products into the database
 * This is a safer alternative to web scraping
 */

import * as dotenv from 'dotenv';
import { Client, Databases, ID } from 'node-appwrite';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const PRODUCTS_COLLECTION_ID = 'products';

// Sample women's clothing products
const sampleProducts = [
  {
    name: 'Floral Print Maxi Dress',
    title: 'Floral Print Maxi Dress',
    handle: 'floral-print-maxi-dress-1001',
    description:
      'Beautiful floral print maxi dress perfect for summer. Features adjustable straps and flowing fabric.',
    price: 89.99,
    compareAtPrice: 129.99,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
      'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800'
    ],
    stock: 50,
    tags: ['dress', 'summer', 'floral', 'maxi']
  },
  {
    name: 'Classic White T-Shirt',
    title: 'Classic White T-Shirt',
    handle: 'classic-white-t-shirt-1002',
    description: 'Essential wardrobe staple. Premium cotton white t-shirt with a relaxed fit.',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
    stock: 100,
    tags: ['t-shirt', 'basic', 'white', 'cotton']
  },
  {
    name: 'High Waist Skinny Jeans',
    title: 'High Waist Skinny Jeans',
    handle: 'high-waist-skinny-jeans-1003',
    description: 'Flattering high-waisted skinny jeans with stretch denim for ultimate comfort.',
    price: 79.99,
    compareAtPrice: 99.99,
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800'],
    stock: 75,
    tags: ['jeans', 'denim', 'skinny', 'high-waist']
  },
  {
    name: 'Cozy Knit Sweater',
    title: 'Cozy Knit Sweater',
    handle: 'cozy-knit-sweater-1004',
    description:
      'Soft and warm knit sweater perfect for chilly days. Available in multiple colors.',
    price: 69.99,
    compareAtPrice: 89.99,
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800'],
    stock: 60,
    tags: ['sweater', 'knit', 'winter', 'cozy']
  },
  {
    name: 'Leather Jacket',
    title: 'Leather Jacket',
    handle: 'leather-jacket-1005',
    description: 'Edgy faux leather jacket with zipper details. Perfect for layering.',
    price: 149.99,
    compareAtPrice: 199.99,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
    stock: 40,
    tags: ['jacket', 'leather', 'outerwear', 'edgy']
  },
  {
    name: 'Summer Shorts',
    title: 'Summer Shorts',
    handle: 'summer-shorts-1006',
    description: 'Lightweight cotton shorts for hot summer days. Comfortable and stylish.',
    price: 34.99,
    images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800'],
    stock: 80,
    tags: ['shorts', 'summer', 'cotton', 'casual']
  },
  {
    name: 'Elegant Blouse',
    title: 'Elegant Blouse',
    handle: 'elegant-blouse-1007',
    description: 'Sophisticated silk-like blouse perfect for work or special occasions.',
    price: 54.99,
    compareAtPrice: 74.99,
    images: ['https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=800'],
    stock: 55,
    tags: ['blouse', 'elegant', 'work', 'silk']
  },
  {
    name: 'Workout Leggings',
    title: 'Workout Leggings',
    handle: 'workout-leggings-1008',
    description: 'High-performance leggings with moisture-wicking fabric. Perfect for yoga or gym.',
    price: 44.99,
    images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800'],
    stock: 90,
    tags: ['leggings', 'activewear', 'workout', 'yoga']
  },
  {
    name: 'Pleated Midi Skirt',
    title: 'Pleated Midi Skirt',
    handle: 'pleated-midi-skirt-1009',
    description: 'Feminine pleated midi skirt that moves beautifully. Versatile for any occasion.',
    price: 64.99,
    compareAtPrice: 84.99,
    images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800'],
    stock: 65,
    tags: ['skirt', 'pleated', 'midi', 'feminine']
  },
  {
    name: 'Casual Cardigan',
    title: 'Casual Cardigan',
    handle: 'casual-cardigan-1010',
    description: 'Comfortable open-front cardigan perfect for layering. Soft and breathable.',
    price: 49.99,
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
    stock: 70,
    tags: ['cardigan', 'layering', 'casual', 'comfort']
  },
  {
    name: 'Evening Gown',
    title: 'Evening Gown',
    handle: 'evening-gown-1011',
    description:
      'Stunning floor-length evening gown with elegant draping. Perfect for formal events.',
    price: 199.99,
    compareAtPrice: 299.99,
    images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800'],
    stock: 25,
    tags: ['gown', 'evening', 'formal', 'elegant']
  },
  {
    name: 'Denim Jacket',
    title: 'Denim Jacket',
    handle: 'denim-jacket-1012',
    description: 'Classic denim jacket that never goes out of style. Great for any season.',
    price: 89.99,
    images: ['https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=800'],
    stock: 55,
    tags: ['jacket', 'denim', 'classic', 'casual']
  },
  {
    name: 'Striped T-Shirt Dress',
    title: 'Striped T-Shirt Dress',
    handle: 'striped-tshirt-dress-1013',
    description: 'Comfy and cute striped t-shirt dress. Easy to wear and style.',
    price: 39.99,
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800'],
    stock: 85,
    tags: ['dress', 't-shirt', 'striped', 'casual']
  },
  {
    name: 'Wide Leg Pants',
    title: 'Wide Leg Pants',
    handle: 'wide-leg-pants-1014',
    description: 'Trendy wide leg pants with a comfortable high waist. Flowy and flattering.',
    price: 69.99,
    compareAtPrice: 89.99,
    images: ['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800'],
    stock: 60,
    tags: ['pants', 'wide-leg', 'trendy', 'high-waist']
  },
  {
    name: 'Crop Top',
    title: 'Crop Top',
    handle: 'crop-top-1015',
    description:
      'Trendy crop top perfect for pairing with high-waisted bottoms. Soft and stretchy.',
    price: 29.99,
    images: ['https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=800'],
    stock: 95,
    tags: ['crop-top', 'trendy', 'casual', 'summer']
  },
  {
    name: 'Blazer',
    title: 'Blazer',
    handle: 'blazer-1016',
    description: 'Professional blazer with a tailored fit. Essential for work wardrobe.',
    price: 129.99,
    compareAtPrice: 179.99,
    images: ['https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800'],
    stock: 45,
    tags: ['blazer', 'professional', 'work', 'tailored']
  },
  {
    name: 'Bohemian Maxi Skirt',
    title: 'Bohemian Maxi Skirt',
    handle: 'bohemian-maxi-skirt-1017',
    description:
      'Flowy bohemian-style maxi skirt with beautiful patterns. Free-spirited and comfortable.',
    price: 59.99,
    images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800'],
    stock: 50,
    tags: ['skirt', 'maxi', 'bohemian', 'flowy']
  },
  {
    name: 'Tank Top Pack',
    title: 'Tank Top Pack',
    handle: 'tank-top-pack-1018',
    description: 'Set of 3 basic tank tops in essential colors. Perfect layering pieces.',
    price: 39.99,
    images: ['https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800'],
    stock: 100,
    tags: ['tank-top', 'basic', 'pack', 'layering']
  },
  {
    name: 'Wrap Dress',
    title: 'Wrap Dress',
    handle: 'wrap-dress-1019',
    description: 'Flattering wrap dress with adjustable fit. Elegant and versatile.',
    price: 79.99,
    compareAtPrice: 109.99,
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'],
    stock: 55,
    tags: ['dress', 'wrap', 'elegant', 'versatile']
  },
  {
    name: 'Jogger Pants',
    title: 'Jogger Pants',
    handle: 'jogger-pants-1020',
    description:
      'Comfortable jogger pants perfect for lounging or running errands. Soft cotton blend.',
    price: 44.99,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800'],
    stock: 80,
    tags: ['joggers', 'pants', 'comfort', 'casual']
  }
];

async function importProduct(product: (typeof sampleProducts)[0]) {
  const doc = await databases.createDocument(DATABASE_ID, PRODUCTS_COLLECTION_ID, ID.unique(), {
    handle: product.handle,
    title: product.title,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice || 0,
    availableForSale: true,
    images: product.images,
    stock: product.stock
  });

  return doc;
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         SAMPLE PRODUCTS IMPORTER                          ║
╚════════════════════════════════════════════════════════════╝

Configuration:
  - Total Products: ${sampleProducts.length}
  - Database: ${DATABASE_ID}
  - Collection: ${PRODUCTS_COLLECTION_ID}

`);

  try {
    console.log('💾 Importing sample products...\n');

    let imported = 0;
    let failed = 0;

    for (const product of sampleProducts) {
      try {
        await importProduct(product);
        imported++;
        console.log(`✅ Imported: ${product.name} - ${product.price} DT`);
      } catch (error) {
        failed++;
        console.error(`❌ Failed: ${product.name}`, error);
      }

      // Small delay to avoid overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ IMPORT COMPLETED');
    console.log('='.repeat(60));
    console.log(`Imported: ${imported} products`);
    console.log(`Failed:   ${failed} products`);
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
