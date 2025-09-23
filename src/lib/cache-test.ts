// Test file to diagnose caching issues
console.log('🔧 Testing cache manager...');

// Import cache manager
import { CACHE_CONFIGS, cacheManager } from './browser-cache';

// Test function
async function testCache() {
  console.log('🧪 Starting cache test...');
  
  try {
    // Simple test
    await cacheManager.set('test', { message: 'hello' }, CACHE_CONFIGS.CONTENT);
    const result = await cacheManager.get('test', CACHE_CONFIGS.CONTENT);
    
    console.log('Test result:', result);
    
    const stats = await cacheManager.getStats();
    console.log('Stats:', stats);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run test if in browser
if (typeof window !== 'undefined') {
  testCache();
}

export { testCache };
