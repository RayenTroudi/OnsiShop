// Test script to verify image upload functionality
const testImageUpload = async () => {
  try {
    console.log('🧪 Testing image upload functionality...');
    
    // Create a simple test base64 image (1x1 pixel PNG)
    const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGlBkYYfQAAAABJRU5ErkJggg==';
    
    // Test the upload endpoint
    const formData = new FormData();
    
    // Convert base64 to blob for testing
    const response = await fetch(testBase64);
    const blob = await response.blob();
    const file = new File([blob], 'test.png', { type: 'image/png' });
    
    formData.append('file', file);
    
    const uploadResponse = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (uploadResponse.ok) {
      const result = await uploadResponse.json();
      console.log('✅ Upload successful!');
      console.log('📤 Returned URL type:', typeof result.url);
      console.log('📤 URL starts with data:', result.url?.startsWith('data:'));
      console.log('📤 URL length:', result.url?.length);
      return result.url;
    } else {
      const error = await uploadResponse.json();
      console.error('❌ Upload failed:', error);
      return null;
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    return null;
  }
};

// Test if running in browser
if (typeof window !== 'undefined') {
  console.log('🌐 Browser environment detected');
  console.log('🎯 You can now test image uploads in the admin interface');
  console.log('📍 Current page:', window.location.href);
  
  // Add test function to window for manual testing
  window.testImageUpload = testImageUpload;
  console.log('🔧 Use window.testImageUpload() to test the upload endpoint');
} else {
  console.log('🖥️ Node.js environment - this is for browser testing');
}
