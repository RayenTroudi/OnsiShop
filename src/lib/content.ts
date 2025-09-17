// lib/content.ts - Utility functions for fetching site content

/**
 * Fetch site content from the API
 * This function can be used in both server and client components
 */
export async function getSiteContent(): Promise<Record<string, string>> {
  try {
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/content`, {
      cache: 'no-store', // Always fetch fresh content
    });

    if (!response.ok) {
      console.error('Failed to fetch content:', response.statusText);
      return {};
    }

    const result = await response.json();
    return result.success ? result.data || {} : {};
  } catch (error) {
    console.error('Error fetching content:', error);
    return {};
  }
}

/**
 * Get a specific content value by key with fallback
 */
export function getContentValue(
  content: Record<string, string>, 
  key: string, 
  fallback: string = ''
): string {
  return content[key] || fallback;
}

/**
 * Default content values as fallbacks
 */
export const DEFAULT_CONTENT_VALUES = {
  'hero_title': 'Welcome to Our Clothing Store',
  'hero_subtitle': 'Discover the latest fashion trends and styles',
  'hero_description': 'Shop our collection of high-quality clothing for men and women. From casual wear to formal attire, we have everything you need to look your best.',
  'hero_button_text': 'Shop Now',
  'hero_background_video': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Default external video
  'hero_background_image': '/images/placeholder.jpg',
  'promotion_title': 'Stay Warm,\nStay Stylish',
  'promotion_subtitle': 'Stay cozy and fashionable this winter with our winter collection!',
  'promotion_button_text': 'View Collection',
  'promotion_button_link': '/search/winter-2024',
  'promotion_background_image': '/images/placeholder.jpg',
  'about_title': 'Perfect blend of Japanese and Western fashion',
  'about_description': 'We strive to create pieces that are both unique and timeless and take pride in offering high-quality clothing that is both comfortable and stylish.',
  'about_button_text': 'About Us',
  'footer_company_name': 'Clothing Store',
  'footer_description': 'Your fashion destination',
  'contact_email': 'contact@clothingstore.com',
  'contact_phone': '+1 (555) 123-4567',
  'contact_address': '123 Fashion Street, Style City, SC 12345'
} as const;
