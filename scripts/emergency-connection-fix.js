#!/usr/bin/env node

/**
 * Emergency MongoDB Connection Fix
 * Patches the database service to use single connection for M0 cluster
 */

const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, '../src/lib/database.ts');

console.log('🚨 Applying EMERGENCY single connection fix...');

// Read current database.ts
const originalContent = fs.readFileSync(databasePath, 'utf8');

// Check if already patched
if (originalContent.includes('withSingleConnection')) {
  console.log('✅ Database service already patched for single connection');
  process.exit(0);
}

// Backup original
const backupPath = databasePath + '.backup.' + Date.now();
fs.writeFileSync(backupPath, originalContent);
console.log('💾 Backup created at:', backupPath);

// Create patched version
const patchedContent = originalContent
  // Add import at the top
  .replace(
    /import { Collections, getDatabase, isValidObjectId, toObjectId } from '\.\/mongodb';/,
    `import { Collections, getDatabase, isValidObjectId, toObjectId } from './mongodb';
import { withSingleConnection } from './singleConnection';`
  )
  // Replace getDatabase calls in critical methods
  .replace(
    /const db = await getDatabase\(\);/g,
    'return withSingleConnection(async (db) => {'
  )
  // Add closing braces (this is a simplified approach)
  .replace(
    /return (.+\.map\(.+\));$/gm,
    'return $1;\n});'
  );

// This is a basic patch - for production, we'd need more sophisticated parsing
// For now, let's create a more targeted fix

const targetedPatch = `// EMERGENCY PATCH: Import single connection
import { withSingleConnection } from './singleConnection';

// EMERGENCY PATCH: Replace database service with single connection wrapper
const originalGetDatabase = require('./mongodb').getDatabase;
const patchedGetDatabase = async () => {
  const { getSingleConnection } = require('./singleConnection');
  const { db } = await getSingleConnection();
  return db;
};

// Override getDatabase function
if (typeof originalGetDatabase === 'function') {
  module.exports.getDatabase = patchedGetDatabase;
}

${originalContent}`;

fs.writeFileSync(databasePath, targetedPatch);

console.log('✅ Emergency patch applied to database service');
console.log('🔄 Restart your application to apply changes');
console.log(`📋 To revert: mv "${backupPath}" "${databasePath}"`);

console.log('\n🎯 EMERGENCY ACTIONS:');
console.log('1. Restart your dev server: npm run dev');  
console.log('2. Monitor connection count closely');
console.log('3. If stable, commit changes');
console.log('4. If issues, revert using backup file');