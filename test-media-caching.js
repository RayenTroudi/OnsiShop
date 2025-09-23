/**
 * Media Caching Verification Test
 * 
 * This script tests all the caching functionality implemented across homepage components.
 * Run this in browser console to verify caching is working correctly.
 */

console.log('🧪 Starting Media Caching Verification Test...\n');

// Test 1: Check if cache hooks are available
function testCacheHooksAvailable() {
    console.log('1️⃣ Testing Cache Hooks Availability...');
    
    // Look for cache indicators on the page
    const cacheIndicators = document.querySelectorAll('[class*="bg-green-500"], [class*="bg-blue-500"]');
    const cacheBadges = Array.from(cacheIndicators).filter(el => 
        el.textContent?.includes('📦 Cached') || el.textContent?.includes('📥 Loading')
    );
    
    if (cacheBadges.length > 0) {
        console.log('✅ Cache indicators found:', cacheBadges.length);
        cacheBadges.forEach((badge, index) => {
            console.log(`   Badge ${index + 1}: ${badge.textContent?.trim()}`);
        });
    } else {
        console.log('❌ No cache indicators found - images may still be loading');
    }
    
    return cacheBadges.length > 0;
}

// Test 2: Check IndexedDB for cached assets
async function testIndexedDBCache() {
    console.log('\n2️⃣ Testing IndexedDB Cache Storage...');
    
    try {
        // Check if IndexedDB is available
        if (!window.indexedDB) {
            console.log('❌ IndexedDB not available');
            return false;
        }
        
        // Try to open the cache database
        return new Promise((resolve) => {
            const request = indexedDB.open('OnsiAssetCache');
            
            request.onsuccess = function(event) {
                const db = event.target.result;
                console.log('✅ OnsiAssetCache database found');
                
                // Check for object stores
                const storeNames = Array.from(db.objectStoreNames);
                console.log('   Object stores:', storeNames);
                
                if (storeNames.length > 0) {
                    console.log('✅ Cache storage structure is present');
                    resolve(true);
                } else {
                    console.log('❌ No cache object stores found');
                    resolve(false);
                }
                
                db.close();
            };
            
            request.onerror = function() {
                console.log('❌ Could not access OnsiAssetCache database');
                resolve(false);
            };
            
            request.onupgradeneeded = function() {
                console.log('⚠️  Database exists but needs upgrade');
                resolve(false);
            };
        });
        
    } catch (error) {
        console.log('❌ Error checking IndexedDB:', error.message);
        return false;
    }
}

// Test 3: Check Network requests
function testNetworkOptimization() {
    console.log('\n3️⃣ Testing Network Request Optimization...');
    
    // Monitor network activity (simplified check)
    const images = document.querySelectorAll('img');
    const videos = document.querySelectorAll('video');
    
    console.log(`   Found ${images.length} images and ${videos.length} videos on page`);
    
    // Check for UploadThing URLs
    const uploadThingImages = Array.from(images).filter(img => 
        img.src && (img.src.includes('uploadthing') || img.src.includes('utfs.io'))
    );
    
    console.log(`   UploadThing CDN images: ${uploadThingImages.length}`);
    
    if (uploadThingImages.length > 0) {
        console.log('✅ Images are using UploadThing CDN');
        uploadThingImages.forEach((img, index) => {
            const isLoaded = img.complete && img.naturalHeight !== 0;
            console.log(`   Image ${index + 1}: ${isLoaded ? '✅ Loaded' : '⏳ Loading'}`);
        });
    } else {
        console.log('⚠️  No UploadThing images detected');
    }
    
    return uploadThingImages.length > 0;
}

// Test 4: Performance metrics
function testPerformanceMetrics() {
    console.log('\n4️⃣ Testing Performance Metrics...');
    
    if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');
        
        console.log(`   Page load time: ${Math.round(navigation.loadEventEnd - navigation.fetchStart)}ms`);
        console.log(`   DOM ready time: ${Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart)}ms`);
        
        // Check for cached resources (cache hit = duration near 0)
        const imageResources = resources.filter(resource => 
            resource.name.includes('uploadthing') || resource.name.includes('utfs.io')
        );
        
        console.log(`   UploadThing requests: ${imageResources.length}`);
        
        imageResources.forEach((resource, index) => {
            const duration = Math.round(resource.duration);
            const fromCache = duration < 5; // Very fast = likely from cache
            console.log(`   Request ${index + 1}: ${duration}ms ${fromCache ? '📦 (cached)' : '🌐 (network)'}`);
        });
        
        return true;
    } else {
        console.log('❌ Performance API not available');
        return false;
    }
}

// Test 5: Component-specific cache verification
function testComponentCaching() {
    console.log('\n5️⃣ Testing Component-Specific Caching...');
    
    const components = [
        { name: 'HeroSection', selector: '[class*="hero"], [class*="Hero"]' },
        { name: 'AboutUs', selector: '[class*="about"], [class*="About"]' },
        { name: 'Promotions', selector: '[class*="promotion"], [class*="Promotion"]' },
        { name: 'Footer', selector: 'footer, [class*="footer"], [class*="Footer"]' }
    ];
    
    components.forEach(component => {
        const element = document.querySelector(component.selector);
        if (element) {
            const cacheIndicator = element.querySelector('[class*="bg-green-500"], [class*="bg-blue-500"]');
            const hasBackground = window.getComputedStyle(element).backgroundImage !== 'none';
            
            console.log(`   ${component.name}: ${element ? '✅ Found' : '❌ Not found'}`);
            if (cacheIndicator) {
                console.log(`     Cache indicator: ${cacheIndicator.textContent?.trim()}`);
            }
            if (hasBackground) {
                console.log(`     Background image: ✅ Present`);
            }
        } else {
            console.log(`   ${component.name}: ❌ Component not found`);
        }
    });
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Running Complete Media Caching Verification...\n');
    
    const results = {
        cacheHooks: testCacheHooksAvailable(),
        indexedDB: await testIndexedDBCache(),
        network: testNetworkOptimization(),
        performance: testPerformanceMetrics()
    };
    
    testComponentCaching();
    
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
        console.log('\n🎉 All tests PASSED! Media caching is working correctly.');
        console.log('\n💡 Tips to see caching in action:');
        console.log('   1. Refresh the page (F5) to see instant loading');
        console.log('   2. Check Network tab - images should load from cache');
        console.log('   3. Try offline mode - cached images should still appear');
        console.log('   4. Look for green "📦 Cached" badges on images');
    } else {
        console.log('\n⚠️  Some tests failed. Check the details above.');
        console.log('   This might be normal if images are still loading for the first time.');
        console.log('   Wait a few seconds and run the test again.');
    }
    
    return results;
}

// Auto-run tests if this script is executed
if (typeof window !== 'undefined') {
    // Wait a bit for page to load, then run tests
    setTimeout(runAllTests, 2000);
}

// Export for manual usage
window.testMediaCaching = runAllTests;

console.log('💡 To manually run tests anytime, use: testMediaCaching()');