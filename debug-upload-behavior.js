require('dotenv').config();

async function debugUploadBehavior() {
  console.log('🔍 Debugging upload behavior...\n');
  
  console.log('📋 Potential causes of downloads in VS Code:');
  console.log('1. File input onChange triggering browser download');
  console.log('2. Response headers causing download interpretation');
  console.log('3. VS Code intercepting file operations');
  console.log('4. Browser behavior with uploaded files');
  console.log('5. Automatic preview/open behavior');
  
  console.log('\n🧪 Testing upload endpoint directly...');
  
  try {
    // Test if the upload endpoint returns proper JSON
    const testResponse = await fetch('http://localhost:3000/api/admin/upload-image', {
      method: 'GET'
    });
    
    console.log('Upload endpoint GET status:', testResponse.status);
    console.log('Upload endpoint headers:', Object.fromEntries(testResponse.headers.entries()));
    
    if (testResponse.status === 405) {
      console.log('✅ Upload endpoint properly rejects GET requests');
    }
    
  } catch (error) {
    console.error('❌ Error testing upload endpoint:', error);
  }
  
  console.log('\n💡 Potential Solutions:');
  console.log('1. Add explicit Content-Disposition: inline headers');
  console.log('2. Use FormData with specific MIME type handling');
  console.log('3. Implement drag-and-drop instead of file input');
  console.log('4. Use base64 encoding for file transfer');
  console.log('5. Add VS Code-specific event prevention');
  
  console.log('\n🎯 Recommended Next Steps:');
  console.log('1. Check if download happens DURING upload or AFTER');
  console.log('2. Test with different file types (JPG vs PNG)');
  console.log('3. Try uploading in regular browser vs VS Code');
  console.log('4. Monitor network tab for response headers');
  console.log('5. Check VS Code settings for file handling');
}

debugUploadBehavior();
