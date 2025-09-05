const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDoubleEncodedImages() {
  console.log('🔧 Fixing double-encoded image data...');
  
  try {
    const products = await prisma.product.findMany({
      where: {
        images: {
          not: null
        }
      }
    });
    
    console.log(`📊 Found ${products.length} products with images`);
    let fixedCount = 0;
    
    for (const product of products) {
      try {
        console.log(`\n🔍 Checking product: ${product.id} (${product.title})`);
        console.log(`📝 Raw images data: ${product.images}`);
        
        let images = JSON.parse(product.images);
        console.log(`📋 Parsed images:`, images);
        
        let needsFix = false;
        let finalImages = [];
        
        if (Array.isArray(images)) {
          // Check each image in the array
          for (let i = 0; i < images.length; i++) {
            const img = images[i];
            console.log(`  🖼️ Image ${i}:`, typeof img, img.substring ? img.substring(0, 100) + '...' : img);
            
            if (typeof img === 'string') {
              // Check if this string itself is a JSON array
              if (img.trim().startsWith('[') && img.trim().endsWith(']')) {
                console.log(`  🚨 Found double-encoded JSON array at index ${i}`);
                try {
                  const innerArray = JSON.parse(img);
                  if (Array.isArray(innerArray)) {
                    console.log(`  ✅ Successfully parsed inner array with ${innerArray.length} items`);
                    finalImages.push(...innerArray);
                    needsFix = true;
                  } else {
                    finalImages.push(img);
                  }
                } catch (parseError) {
                  console.log(`  ⚠️ Failed to parse as JSON, keeping as string`);
                  finalImages.push(img);
                }
              } else {
                // Regular string, keep it
                finalImages.push(img);
              }
            } else {
              // Not a string, keep as is
              finalImages.push(img);
            }
          }
        } else {
          // Not an array, check if it's a string that should be an array
          if (typeof images === 'string' && images.trim().startsWith('[')) {
            console.log(`  🚨 Found string that looks like JSON array`);
            try {
              const parsed = JSON.parse(images);
              if (Array.isArray(parsed)) {
                finalImages = parsed;
                needsFix = true;
              } else {
                finalImages = [images];
              }
            } catch (parseError) {
              finalImages = [images];
            }
          } else {
            finalImages = [images];
          }
        }
        
        console.log(`  🎯 Final images:`, finalImages);
        
        if (needsFix) {
          console.log(`  🔧 Fixing product ${product.id}`);
          
          // Clean up the final images array
          const cleanImages = finalImages.filter(img => 
            img && 
            typeof img === 'string' && 
            (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/')) &&
            !img.includes('[') && 
            !img.includes(']')
          );
          
          console.log(`  ✨ Clean images (${cleanImages.length}):`, cleanImages.map(img => img.substring(0, 50) + '...'));
          
          await prisma.product.update({
            where: { id: product.id },
            data: {
              images: cleanImages.length > 0 ? JSON.stringify(cleanImages) : null
            }
          });
          
          fixedCount++;
          console.log(`  ✅ Fixed product ${product.id}`);
        } else {
          console.log(`  ✅ Product ${product.id} is already clean`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing product ${product.id}:`, error);
      }
    }
    
    console.log(`\n🎉 Completed! Fixed ${fixedCount} products`);
    
  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDoubleEncodedImages();
