/**
 * UploadThing Connectivity and Error Diagnostic Tool
 * 
 * This script helps diagnose UploadThing connectivity issues and provides
 * detailed information about network problems, configuration issues, and
 * suggests fixes for common problems.
 */

console.log('🔍 Starting UploadThing Connectivity Diagnostics...\n');

// Test 1: Check Environment Variables
function checkEnvironmentVariables() {
    console.log('1️⃣ Checking Environment Variables...');
    
    const requiredEnvs = [
        'UPLOADTHING_SECRET',
        'UPLOADTHING_APP_ID',
        'UPLOADTHING_TOKEN'
    ];
    
    let allValid = true;
    
    requiredEnvs.forEach(envVar => {
        // In browser, we can't check server env vars directly
        // This would need to be run on the server side
        console.log(`   ${envVar}: ${envVar in process?.env ? '✅ Present' : '❓ Unknown (browser context)'}`);
    });
    
    return allValid;
}

// Test 2: Check UploadThing API Connectivity
async function checkUploadThingAPI() {
    console.log('\n2️⃣ Testing UploadThing API Connectivity...');
    
    try {
        // Test basic API endpoint
        const response = await fetch('/api/uploadthing', {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        
        console.log(`   API Response: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            console.log('   ✅ UploadThing API endpoint is accessible');
            return true;
        } else {
            console.log('   ❌ UploadThing API endpoint returned error');
            return false;
        }
    } catch (error) {
        console.error('   ❌ UploadThing API connection failed:', error.message);
        
        if (error.name === 'AbortError') {
            console.log('   🕐 Connection timed out - possible network/firewall issue');
        } else if (error.message.includes('fetch')) {
            console.log('   🌐 Network error - check internet connection');
        }
        
        return false;
    }
}

// Test 3: Check UploadThing External Services
async function checkUploadThingServices() {
    console.log('\n3️⃣ Testing UploadThing External Services...');
    
    const services = [
        { name: 'UploadThing CDN', url: 'https://utfs.io' },
        { name: 'UploadThing Ingest (SEA1)', url: 'https://sea1.ingest.uploadthing.com' },
        { name: 'UploadThing API', url: 'https://api.uploadthing.com' }
    ];
    
    for (const service of services) {
        try {
            console.log(`   Testing ${service.name}...`);
            
            // Use a simple HEAD request with short timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(service.url, {
                method: 'HEAD',
                signal: controller.signal,
                mode: 'no-cors' // Avoid CORS issues for external services
            });
            
            clearTimeout(timeoutId);
            console.log(`   ✅ ${service.name}: Reachable`);
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log(`   ❌ ${service.name}: Timeout (>3s)`);
            } else {
                console.log(`   ❌ ${service.name}: ${error.message}`);
            }
        }
    }
}

// Test 4: Network Configuration Check
async function checkNetworkConfiguration() {
    console.log('\n4️⃣ Checking Network Configuration...');
    
    // Check if we're behind a proxy or firewall
    const networkInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        onLine: navigator.onLine,
        connectionType: navigator.connection?.effectiveType || 'unknown'
    };
    
    console.log('   Network Information:');
    console.log(`     Online Status: ${networkInfo.onLine ? '✅ Online' : '❌ Offline'}`);
    console.log(`     Connection Type: ${networkInfo.connectionType}`);
    console.log(`     User Agent: ${networkInfo.userAgent.substring(0, 50)}...`);
    
    // Test basic internet connectivity
    try {
        const start = Date.now();
        await fetch('https://httpbin.org/get', {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });
        const latency = Date.now() - start;
        console.log(`   ✅ Internet connectivity: OK (${latency}ms)`);
        
        return true;
    } catch (error) {
        console.log('   ❌ Internet connectivity: Failed');
        console.log('     This might indicate firewall/proxy issues');
        return false;
    }
}

// Test 5: Common Error Patterns
function diagnoseCommonErrors(error) {
    console.log('\n5️⃣ Diagnosing Common Error Patterns...');
    
    const errorPatterns = [
        {
            pattern: /Transport error.*POST.*ingest\.uploadthing\.com/,
            name: 'UploadThing Ingest Server Timeout',
            causes: [
                'Network connectivity issues',
                'Firewall blocking HTTPS requests',
                'Corporate proxy restrictions',
                'UploadThing server overload',
                'DNS resolution problems'
            ],
            solutions: [
                'Check internet connection',
                'Disable VPN temporarily',
                'Check corporate firewall settings',
                'Try different network (mobile hotspot)',
                'Wait and retry (server might be temporarily down)',
                'Contact UploadThing support if persistent'
            ]
        },
        {
            pattern: /Connect Timeout Error/,
            name: 'Connection Timeout',
            causes: [
                'Slow internet connection',
                'Server overload',
                'Network congestion',
                'Firewall blocking connections'
            ],
            solutions: [
                'Increase timeout settings',
                'Use enhanced retry logic',
                'Check network stability',
                'Try uploading smaller files'
            ]
        },
        {
            pattern: /Failed to register metadata/,
            name: 'Metadata Registration Failure',
            causes: [
                'Database connection issues',
                'UploadThing API key problems',
                'Server configuration errors'
            ],
            solutions: [
                'Verify UPLOADTHING_SECRET is correct',
                'Check database connectivity',
                'Restart development server'
            ]
        }
    ];
    
    const errorString = error?.toString() || '';
    
    for (const pattern of errorPatterns) {
        if (pattern.pattern.test(errorString)) {
            console.log(`   🎯 Detected: ${pattern.name}`);
            console.log('   Possible Causes:');
            pattern.causes.forEach(cause => console.log(`     • ${cause}`));
            console.log('   Suggested Solutions:');
            pattern.solutions.forEach(solution => console.log(`     ✅ ${solution}`));
            return pattern;
        }
    }
    
    console.log('   ❓ Unknown error pattern - check UploadThing documentation');
    return null;
}

// Test 6: Provide Configuration Fixes
function suggestConfigurationFixes() {
    console.log('\n6️⃣ Configuration Fix Suggestions...');
    
    console.log('   Quick Fixes to Try:');
    console.log('   ✅ 1. Restart development server (npm run dev)');
    console.log('   ✅ 2. Check .env.local file has correct UPLOADTHING_SECRET');
    console.log('   ✅ 3. Verify internet connection is stable');
    console.log('   ✅ 4. Try uploading smaller files first');
    console.log('   ✅ 5. Disable VPN/proxy temporarily');
    console.log('   ✅ 6. Clear browser cache and cookies');
    
    console.log('\n   Advanced Fixes:');
    console.log('   🔧 1. Update UploadThing packages: npm update uploadthing @uploadthing/react');
    console.log('   🔧 2. Add retry logic to upload functions');
    console.log('   🔧 3. Implement fallback upload mechanism');
    console.log('   🔧 4. Configure custom timeout settings');
    console.log('   🔧 5. Add error boundary components');
    
    console.log('\n   Network-Specific Fixes:');
    console.log('   🌐 1. Corporate Network: Contact IT about uploadthing.com whitelist');
    console.log('   🌐 2. Mobile Network: Try WiFi instead');
    console.log('   🌐 3. VPN Issues: Disconnect VPN temporarily');
    console.log('   🌐 4. Proxy Settings: Configure proxy bypass for *.uploadthing.com');
}

// Main diagnostic function
async function runUploadThingDiagnostics(lastError = null) {
    console.log('🚀 UploadThing Connectivity & Error Diagnostics');
    console.log('==============================================\n');
    
    const results = {
        envVars: checkEnvironmentVariables(),
        api: await checkUploadThingAPI(),
        services: await checkUploadThingServices(),
        network: await checkNetworkConfiguration()
    };
    
    if (lastError) {
        diagnoseCommonErrors(lastError);
    }
    
    suggestConfigurationFixes();
    
    console.log('\n📊 Diagnostic Results Summary:');
    console.log('==============================');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
        console.log('\n🎉 All connectivity tests passed!');
        console.log('💡 If uploads still fail, the issue might be temporary server problems.');
        console.log('   Try the enhanced retry logic or wait a few minutes and try again.');
    } else {
        console.log('\n⚠️  Some connectivity tests failed.');
        console.log('💡 Follow the suggested fixes above to resolve the issues.');
        console.log('🔄 Run this diagnostic again after applying fixes.');
    }
    
    return results;
}

// Auto-run diagnostics and make available globally
if (typeof window !== 'undefined') {
    // Store last error for diagnosis
    window.lastUploadThingError = null;
    
    // Enhanced error logging
    const originalConsoleError = console.error;
    console.error = function(...args) {
        const errorStr = args.join(' ');
        if (errorStr.includes('uploadthing') || errorStr.includes('Transport error')) {
            window.lastUploadThingError = errorStr;
        }
        originalConsoleError.apply(console, args);
    };
    
    // Make diagnostic functions available globally
    window.runUploadThingDiagnostics = runUploadThingDiagnostics;
    window.diagnoseLastError = () => {
        if (window.lastUploadThingError) {
            diagnoseCommonErrors(new Error(window.lastUploadThingError));
        } else {
            console.log('No recent UploadThing errors captured.');
        }
    };
    
    // Auto-run diagnostics after page load
    setTimeout(() => {
        console.log('🔍 Auto-running UploadThing diagnostics...\n');
        runUploadThingDiagnostics();
    }, 3000);
}

console.log('💡 Available commands:');
console.log('   runUploadThingDiagnostics() - Run full diagnostic');
console.log('   diagnoseLastError() - Analyze recent UploadThing errors');

export { diagnoseCommonErrors, runUploadThingDiagnostics };
