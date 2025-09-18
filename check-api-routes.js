// Quick script to check for potential dynamic server errors in API routes

const fs = require('fs');
const path = require('path');

function checkApiRoutes(dir) {
  const results = [];
  
  function scanDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item === 'route.ts') {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Check if it uses request.url (exclude comments)
        const lines = content.split('\n');
        const usesRequestUrl = lines.some(line => {
          const trimmed = line.trim();
          return trimmed.includes('request.url') && !trimmed.startsWith('//') && !trimmed.startsWith('*');
        });
        const hasDynamic = content.includes("export const dynamic = 'force-dynamic'");
        
        if (usesRequestUrl && !hasDynamic) {
          results.push({
            file: fullPath.replace(process.cwd(), ''),
            issue: 'Uses request.url without dynamic export'
          });
        }
      }
    }
  }
  
  scanDirectory(dir);
  return results;
}

console.log('🔍 Scanning API routes for potential deployment issues...\n');

const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
const issues = checkApiRoutes(apiDir);

if (issues.length === 0) {
  console.log('✅ No issues found! All API routes that use request.url have proper dynamic exports.');
} else {
  console.log('❌ Found potential issues:');
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.file}`);
    console.log(`   Issue: ${issue.issue}`);
  });
}

console.log('\n🎯 Summary:');
console.log(`- Scanned all route.ts files in src/app/api`);
console.log(`- Found ${issues.length} potential deployment issues`);
console.log(`- Routes using request.url should have: export const dynamic = 'force-dynamic';`);