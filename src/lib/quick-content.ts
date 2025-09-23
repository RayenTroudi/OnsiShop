// Static content that ensures the hero video always works
export const STATIC_HERO_VIDEO_URL = 'https://utfs.io/f/1rEveYHUVj032V42w1UQTMjXHRnPoA8hBUF7ftDzWE0r12b3';

export const FALLBACK_CONTENT = {
  hero_title: 'Welcome to ONSI Fashion Store',
  hero_subtitle: 'Discover the Latest Trends',
  hero_description: 'Shop our collection of high-quality clothing for men and women.',
  hero_button_text: 'Shop Now',
  hero_background_image: '/images/placeholder-product.svg',
  hero_background_video: STATIC_HERO_VIDEO_URL,
  promotion_title: 'Winter Collection Now Available', 
  promotion_subtitle: 'Stay cozy and fashionable this winter with our new collection!',
  promotion_button_text: 'View Collection',
  promotion_button_link: '/search/winter-2024',
  promotion_background_image: '/images/placeholder-product.svg'
};

// Quick content API that always works
export async function getQuickContent() {
  try {
    // Try to get from localStorage first (client-side caching)
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('hero_content');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const cacheAge = Date.now() - (parsedCache.timestamp || 0);
        // Use cache if less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          console.log('📦 Using cached hero content');
          return parsedCache.data || FALLBACK_CONTENT;
        }
      }
    }
    
    // Try to fetch from API with reasonable timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const response = await fetch('/api/content-new', {
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      
      // Cache successful response
      if (typeof window !== 'undefined' && data.success) {
        localStorage.setItem('hero_content', JSON.stringify({
          data: data.data,
          timestamp: Date.now()
        }));
      }
      
      return data.data || FALLBACK_CONTENT;
    }
  } catch (error) {
    console.warn('⚠️ Content API failed, using fallback:', error);
  }
  
  // Always return fallback content if anything fails
  return FALLBACK_CONTENT;
}