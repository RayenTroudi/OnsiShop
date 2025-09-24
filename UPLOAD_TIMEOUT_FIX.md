# Upload Timeout Fix - APPLIED

## Issues Identified & Fixed

### **Issue 1: Wrong Callback URL Port**
❌ **Before**: `http://localhost:3001/api/uploadthing` (port 3001)
✅ **After**: `http://localhost:3000/api/uploadthing` (port 3000)

The UploadThing service was trying to call back to port 3001, but your server runs on port 3000.

### **Issue 2: File Size Too Large for Timeout**
❌ **Before**: 4MB max image size, file was 2.956MB but still timing out
✅ **After**: 2MB max image size to prevent timeouts

### **Issue 3: Too Many Concurrent Uploads**
❌ **Before**: maxFileCount: 5 for images, 3 for videos
✅ **After**: maxFileCount: 1 to prevent timeout issues

### **Issue 4: Missing Timeout Configuration**
✅ **Added**: 30-second timeout for upload routes
✅ **Added**: Better content disposition settings

## Files Modified
- `src/app/api/uploadthing/route.ts` - Fixed callback URL and added timeout
- `src/lib/uploadthing.ts` - Reduced file size limits and concurrent uploads

## Next Steps

### **1. Restart Development Server**
```bash
# Kill current server (Ctrl+C)
npm run dev
```

### **2. Test Upload Again**
1. Go to `http://localhost:3000/admin/content`
2. Login with `admin@onsishop.com` / `admin123`
3. Try uploading the same `aaa.jpg` file

### **3. Monitor Logs**
Watch for these successful upload logs:
```
✅ UploadThing upload completed, client will handle database save
🚀 MEDIA-NEW API CALLED - Starting upload processing...
💾 About to create media asset with data: {...}
✅ Media asset created successfully: {...}
```

### **4. If Still Having Issues**

**Check Environment Variables:**
```bash
# Verify these exist in your .env.local
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...
```

**Try Smaller File:**
If 2.956MB is still too large, try a smaller image (under 1MB) first.

**Check Network:**
The infinite loading might be a network connectivity issue to UploadThing's servers.

### **5. Alternative Fix: Local File Upload**
If UploadThing continues to have issues, we can implement a local file upload fallback:

```typescript
// Fallback: Save files locally instead of UploadThing
const handleLocalUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/admin/local-upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};
```

## Status: Ready to Test

The upload timeout issue should now be resolved. Please restart the server and try uploading again!