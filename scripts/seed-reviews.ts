import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleComments = [
  "Great quality and fast shipping! The fabric feels premium and the fit is perfect.",
  "Love this product! It exceeded my expectations. Highly recommend to anyone looking for style and comfort.",
  "Good value for money. The design is beautiful and it's very comfortable to wear.",
  "Amazing customer service and the product quality is top-notch. Will definitely buy again!",
  "The sizing is accurate and the material is exactly as described. Very satisfied with my purchase.",
  "Perfect for everyday wear. The color is vibrant and hasn't faded after multiple washes.",
  "Stylish and comfortable. Great attention to detail in the construction.",
  "Exactly what I was looking for! The quality is excellent and delivery was quick.",
  "Beautiful design and great fit. This has become one of my favorite pieces.",
  "Outstanding quality for the price. The craftsmanship is impressive.",
];

async function seedReviewsAndRatings() {
  try {
    console.log('🌱 Starting to seed reviews and ratings...');

    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users`);

    if (users.length === 0) {
      console.log('⚠️ No users found. Creating a demo user...');
      const demoUser = await prisma.user.create({
        data: {
          name: 'Demo Customer',
          email: 'demo@example.com',
          password: 'hashedpassword', // In real app, this would be properly hashed
          role: 'user',
        },
      });
      users.push(demoUser);
    }

    // Get all products
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products`);

    if (products.length === 0) {
      console.log('⚠️ No products found. Please run the product seed script first.');
      return;
    }

    let commentsCreated = 0;
    let ratingsCreated = 0;

    // For each product, create 2-5 reviews
    for (const product of products) {
      const numReviews = Math.floor(Math.random() * 4) + 2; // 2-5 reviews
      
      // Select random users for this product (no duplicates)
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
      const reviewUsers = shuffledUsers.slice(0, Math.min(numReviews, users.length));

      for (let i = 0; i < reviewUsers.length; i++) {
        const user = reviewUsers[i];
        
        // Create rating (1-5 stars, weighted towards higher ratings)
        const randomRating = Math.random();
        let stars;
        if (randomRating < 0.1) stars = 1;
        else if (randomRating < 0.2) stars = 2;
        else if (randomRating < 0.3) stars = 3;
        else if (randomRating < 0.6) stars = 4;
        else stars = 5;

        try {
          // Create rating
          await prisma.rating.create({
            data: {
              productId: product.id,
              userId: user.id,
              stars: stars,
            },
          });
          ratingsCreated++;

          // Create comment (80% chance)
          if (Math.random() < 0.8) {
            const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
            
            await prisma.comment.create({
              data: {
                productId: product.id,
                userId: user.id,
                text: randomComment,
              },
            });
            commentsCreated++;
          }
        } catch (error) {
          // Skip if user already rated this product (unique constraint)
          console.log(`Skipping duplicate rating for user ${user.name} on product ${product.name}`);
        }
      }
    }

    console.log(`✅ Seeding completed!`);
    console.log(`📝 Created ${commentsCreated} comments`);
    console.log(`⭐ Created ${ratingsCreated} ratings`);

    // Show some statistics
    const totalComments = await prisma.comment.count();
    const totalRatings = await prisma.rating.count();
    
    console.log(`\n📊 Database Statistics:`);
    console.log(`Total comments: ${totalComments}`);
    console.log(`Total ratings: ${totalRatings}`);
    console.log(`Total products with reviews: ${products.length}`);

  } catch (error) {
    console.error('❌ Error seeding reviews and ratings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedReviewsAndRatings();
