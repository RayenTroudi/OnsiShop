import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function restoreMediaAssets() {
  try {
    console.log('🎬 Restoring media assets to database...');

    const mediaAssets = [
      // Hero section images
      {
        filename: 'winter.jpg',
        url: '/images/promotions/winter.jpg',
        alt: 'Winter collection promotion banner',
        type: 'IMAGE',
        section: 'hero'
      },
      {
        filename: 'background-image-1756043891412-0nifzaa2fwm.PNG',
        url: '/images/background-image-1756043891412-0nifzaa2fwm.PNG',
        alt: 'Hero background image',
        type: 'IMAGE',
        section: 'hero'
      },
      
      // Navigation and UI images
      {
        filename: 'logo.png',
        url: '/images/logo.png',
        alt: 'ONSI Fashion logo',
        type: 'IMAGE',
        section: 'header'
      },
      {
        filename: 'cart.png',
        url: '/images/cart.png',
        alt: 'Shopping cart icon',
        type: 'IMAGE',
        section: 'header'
      },
      {
        filename: 'profile.png',
        url: '/images/profile.png',
        alt: 'User profile icon',
        type: 'IMAGE',
        section: 'header'
      },
      {
        filename: 'magnifier.png',
        url: '/images/magnifier.png',
        alt: 'Search magnifier icon',
        type: 'IMAGE',
        section: 'header'
      },

      // Social media icons
      {
        filename: 'facebook.png',
        url: '/images/footer/social-media/facebook.png',
        alt: 'Facebook icon',
        type: 'IMAGE',
        section: 'footer'
      },
      {
        filename: 'instagram.png',
        url: '/images/footer/social-media/instagram.png',
        alt: 'Instagram icon',
        type: 'IMAGE',
        section: 'footer'
      },
      {
        filename: 'x.png',
        url: '/images/footer/social-media/x.png',
        alt: 'X (Twitter) icon',
        type: 'IMAGE',
        section: 'footer'
      },
      {
        filename: 'youtube.png',
        url: '/images/footer/social-media/youtube.png',
        alt: 'YouTube icon',
        type: 'IMAGE',
        section: 'footer'
      },
      {
        filename: 'tiktok.png',
        url: '/images/footer/social-media/tiktok.png',
        alt: 'TikTok icon',
        type: 'IMAGE',
        section: 'footer'
      },

      // Payment method icons
      {
        filename: 'visa.png',
        url: '/images/footer/payment-methods/visa.png',
        alt: 'Visa payment method',
        type: 'IMAGE',
        section: 'footer'
      },
      {
        filename: 'mastercard.png',
        url: '/images/footer/payment-methods/mastercard.png',
        alt: 'Mastercard payment method',
        type: 'IMAGE',
        section: 'footer'
      },
      {
        filename: 'paypal.png',
        url: '/images/footer/payment-methods/paypal.png',
        alt: 'PayPal payment method',
        type: 'IMAGE',
        section: 'footer'
      },
      {
        filename: 'applepay.png',
        url: '/images/footer/payment-methods/applepay.png',
        alt: 'Apple Pay payment method',
        type: 'IMAGE',
        section: 'footer'
      },
      {
        filename: 'googlepay.png',
        url: '/images/footer/payment-methods/googlepay.png',
        alt: 'Google Pay payment method',
        type: 'IMAGE',
        section: 'footer'
      },

      // Screenshot
      {
        filename: 'home.webp',
        url: '/images/screenshots/home.webp',
        alt: 'Homepage screenshot',
        type: 'IMAGE',
        section: 'screenshots'
      }
    ];

    // Check if videos exist and add them
    const videoPath = path.join(process.cwd(), 'public', 'videos');
    if (fs.existsSync(videoPath)) {
      const videoFiles = fs.readdirSync(videoPath);
      videoFiles.forEach(filename => {
        if (filename.endsWith('.mp4') || filename.endsWith('.webm')) {
          mediaAssets.push({
            filename: filename,
            url: `/videos/${filename}`,
            alt: `${filename} video`,
            type: 'VIDEO',
            section: 'hero'
          });
        }
      });
    }

    // Clear existing media assets first
    await prisma.mediaAsset.deleteMany();
    console.log('🧹 Cleared existing media assets');

    // Create new media assets
    for (const asset of mediaAssets) {
      // Check if file actually exists
      const filePath = path.join(process.cwd(), 'public', asset.url);
      if (fs.existsSync(filePath)) {
        await prisma.mediaAsset.create({ data: asset });
        console.log(`✅ Added ${asset.filename} (${asset.section})`);
      } else {
        console.log(`⚠️  File not found, skipping: ${asset.filename}`);
      }
    }

    const totalAssets = await prisma.mediaAsset.count();
    console.log(`\n🎉 Media assets restored! Total: ${totalAssets}`);

  } catch (error) {
    console.error('❌ Error restoring media assets:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreMediaAssets();
