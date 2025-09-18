// Test media API upload functionality

async function testMediaAPIUpload() {
  try {
    console.log('🧪 Testing Media API Upload...');
    
    // Create a small test file
    const testContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAHGbxkuygAAAABJRU5ErkJggg==';
    const binaryString = atob(testContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const testFile = new Blob([bytes], { type: 'image/png' });
    
    const formData = new FormData();
    formData.append('file', testFile, 'test.png');
    formData.append('section', 'promotions');
    formData.append('alt', 'Test image');
    
    console.log('📤 Sending upload request...');
    const response = await fetch('https://onsi-shop.vercel.app/api/admin/media', {
      method: 'POST',
      body: formData
    });
    
    console.log('Response Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload Success!');
      console.log('Media Asset:', result);
    } else {
      const errorData = await response.json();
      console.log('❌ Upload Failed');
      console.log('Error:', errorData.error);
      if (errorData.details) {
        console.log('Details:', errorData.details);
      }
    }
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

testMediaAPIUpload();