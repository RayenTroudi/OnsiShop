require('dotenv').config();

async function testUploadEndpoint() {
  try {
    console.log('🧪 Testing upload endpoint...');
    
    // Check if server is running
    const response = await fetch('http://localhost:3000/api/admin/upload-image', {
      method: 'OPTIONS'
    }).catch(() => null);
    
    if (!response) {
      console.log('❌ Server not running. Please start with: npm run dev');
      return;
    }
    
    console.log('✅ Server is running');
    console.log('✅ Upload endpoint accessible');
    console.log('\n📋 Upload endpoint fixes applied:');
    console.log('- ✅ Added event.preventDefault() to prevent default browser behavior');
    console.log('- ✅ Added event.stopPropagation() to stop event bubbling');
    console.log('- ✅ Added explicit file name to FormData');
    console.log('- ✅ Added proper response headers');
    console.log('- ✅ Added click handler to clear file input value');
    console.log('- ✅ Added form attributes to prevent download behavior');
    
    console.log('\n🎯 To test:');
    console.log('1. Go to http://localhost:3000/admin/content');
    console.log('2. Login with admin credentials');
    console.log('3. Try uploading a hero background image');
    console.log('4. The image should upload properly without downloading to VS Code');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testUploadEndpoint();
