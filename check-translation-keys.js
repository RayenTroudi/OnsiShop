// Check for all translation keys used in the app and verify they exist in database
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Function to recursively find all .tsx/.ts files
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to extract translation keys from file content
function extractTranslationKeys(content) {
  const keys = new Set();
  
  // Match t('key') and t("key") patterns
  const singleQuoteMatches = content.match(/t\('([^']+)'\)/g) || [];
  const doubleQuoteMatches = content.match(/t\("([^"]+)"\)/g) || [];
  
  singleQuoteMatches.forEach(match => {
    const key = match.match(/t\('([^']+)'\)/)[1];
    keys.add(key);
  });
  
  doubleQuoteMatches.forEach(match => {
    const key = match.match(/t\("([^"]+)"\)/)[1];
    keys.add(key);
  });
  
  return Array.from(keys);
}

async function checkTranslationKeys() {
  try {
    console.log('🔍 Scanning for translation keys in the codebase...');
    
    // Find all TypeScript/React files
    const srcDir = path.join(__dirname, 'src');
    const files = findFiles(srcDir);
    
    const allKeys = new Set();
    
    // Extract translation keys from each file
    files.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const keys = extractTranslationKeys(content);
        keys.forEach(key => allKeys.add(key));
      } catch (error) {
        console.log(`⚠️ Could not read ${file}`);
      }
    });
    
    console.log(`📋 Found ${allKeys.size} unique translation keys in codebase`);
    
    // Get existing translations from database
    const existingTranslations = await prisma.translation.findMany({
      where: { language: 'fr' }, // Check French as primary
      select: { key: true }
    });
    
    const existingKeys = new Set(existingTranslations.map(t => t.key));
    console.log(`💾 Found ${existingKeys.size} translation keys in database`);
    
    // Find missing keys
    const missingKeys = Array.from(allKeys).filter(key => !existingKeys.has(key));
    
    if (missingKeys.length > 0) {
      console.log(`\n❌ Missing ${missingKeys.length} translation keys in database:`);
      missingKeys.forEach(key => {
        console.log(`   - ${key}`);
      });
    } else {
      console.log('\n✅ All translation keys found in database!');
    }
    
    // Find unused keys (in database but not in code)
    const usedKeys = Array.from(allKeys);
    const unusedKeys = Array.from(existingKeys).filter(key => !allKeys.has(key));
    
    if (unusedKeys.length > 0) {
      console.log(`\n⚠️  Found ${unusedKeys.length} unused translation keys in database:`);
      unusedKeys.forEach(key => {
        console.log(`   - ${key}`);
      });
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Keys in code: ${allKeys.size}`);
    console.log(`   Keys in database: ${existingKeys.size}`);
    console.log(`   Missing keys: ${missingKeys.length}`);
    console.log(`   Unused keys: ${unusedKeys.length}`);
    
    return { allKeys: Array.from(allKeys), missingKeys, unusedKeys };
    
  } catch (error) {
    console.error('❌ Error checking translation keys:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkTranslationKeys();
