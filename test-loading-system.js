#!/usr/bin/env node

/**
 * Loading System Test Script
 * Tests the global loading spinner and video loading functionality
 */

const puppeteer = require('puppeteer');

async function testLoadingSystem() {
  console.log('🧪 Starting loading system test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Monitor console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Loading') || text.includes('Hero') || text.includes('🎬') || text.includes('📊') || text.includes('⚡')) {
      console.log('🔍 Browser:', text);
    }
  });
  
  console.log('🌐 Navigating to homepage...');
  await page.goto('http://localhost:3000');
  
  console.log('⏱️ Waiting for spinner to appear...');
  await page.waitForSelector('.global-loading-overlay', { timeout: 5000 });
  console.log('✅ Loading spinner appeared');
  
  console.log('⏱️ Waiting for video element...');
  await page.waitForSelector('video', { timeout: 10000 });
  console.log('✅ Video element found');
  
  // Check video loading state
  const videoState = await page.evaluate(() => {
    const video = document.querySelector('video');
    return video ? {
      src: video.src,
      readyState: video.readyState,
      duration: video.duration,
      buffered: video.buffered.length > 0 ? video.buffered.end(0) : 0
    } : null;
  });
  
  console.log('🎬 Video state:', videoState);
  
  console.log('⏱️ Waiting for spinner to disappear (max 20 seconds)...');
  try {
    await page.waitForFunction(() => {
      const spinner = document.querySelector('.global-loading-overlay');
      return !spinner || spinner.classList.contains('opacity-0');
    }, { timeout: 20000 });
    console.log('✅ Loading spinner disappeared');
  } catch (error) {
    console.log('⚠️ Spinner did not disappear within 20 seconds');
  }
  
  console.log('⏱️ Waiting for homepage content...');
  await page.waitForSelector('main.fade-in-content', { timeout: 5000 });
  console.log('✅ Homepage content appeared');
  
  console.log('🎉 Test completed! Closing browser...');
  await browser.close();
}

// Run test if this script is executed directly
if (require.main === module) {
  testLoadingSystem().catch(console.error);
}

module.exports = { testLoadingSystem };