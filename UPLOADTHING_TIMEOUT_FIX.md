# 🔧 UploadThing Connection Timeout Fix Guide

## 🚨 **Problem Identified**

You're experiencing **UploadThing ingest server timeouts** with this error:
```
Transport error (POST https://sea1.ingest.uploadthing.com/route-metadata)
ConnectTimeoutError: Connect Timeout Error (timeout: 10000ms)
```

This is a **network connectivity issue** where your local development environment cannot reach UploadThing's servers.

## ⚡ **Immediate Fixes** (Try These First)

### 1. **Restart Everything**
```bash
# Stop the development server (Ctrl+C)
# Then restart:
cd "d:\OnsiShop"
npm run dev
```

### 2. **Check Your Internet Connection**
```bash
# Test basic connectivity
ping uploadthing.com
ping sea1.ingest.uploadthing.com
```

### 3. **Disable VPN/Proxy Temporarily**
- If using VPN, disconnect it temporarily
- If behind corporate proxy, try mobile hotspot
- Corporate firewalls often block UploadThing domains

### 4. **Clear DNS Cache**
```bash
# Windows
ipconfig /flushdns

# Alternative: Use Google DNS
# Change DNS to 8.8.8.8 and 8.8.4.4
```

## 🛠️ **Enhanced Solutions Implemented**

I've created several enhanced solutions for you:

### 1. **Enhanced UploadThing Client** (`uploadthing-enhanced.ts`)
- ✅ **Automatic retry logic** (3 attempts with exponential backoff)
- ✅ **30-second timeout** instead of 10 seconds
- ✅ **Network error detection** and intelligent retry
- ✅ **Connection status monitoring**

### 2. **Connectivity Diagnostics** (`diagnose-uploadthing.js`)
- ✅ **Real-time network testing**
- ✅ **UploadThing service status checking**
- ✅ **Error pattern analysis**
- ✅ **Automated fix suggestions**

## 🔄 **How to Use Enhanced Solutions**

### **Option A: Use Enhanced Upload Hook**
```typescript
// Instead of useUploadThing, use the enhanced version
import { useUploadThingEnhanced } from '@/lib/uploadthing-enhanced';

const { startUpload, isUploading } = useUploadThingEnhanced('mediaUploader');

// This will automatically retry failed uploads
const handleUpload = async (files: File[]) => {
  try {
    const result = await startUpload(files);
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Upload failed after retries:', error);
    // Handle graceful fallback
  }
};
```

### **Option B: Run Diagnostics**
```javascript
// Open browser console and run:
runUploadThingDiagnostics()

// Or analyze specific errors:
diagnoseLastError()
```

## 🌐 **Network-Specific Solutions**

### **Corporate/University Networks**
```bash
# Ask IT to whitelist these domains:
*.uploadthing.com
*.utfs.io
sea1.ingest.uploadthing.com
api.uploadthing.com
```

### **Home Network Issues**
1. **Router Reset**: Unplug router for 30 seconds
2. **Change DNS**: Use Cloudflare DNS (1.1.1.1, 1.0.0.1)
3. **Port Check**: Ensure port 443 (HTTPS) isn't blocked

### **Mobile/Slow Connections**
```typescript
// Use smaller timeout for mobile
const MOBILE_TIMEOUT = 15000; // 15 seconds
const WIFI_TIMEOUT = 30000;   // 30 seconds

const timeout = navigator.connection?.effectiveType === '4g' 
  ? MOBILE_TIMEOUT 
  : WIFI_TIMEOUT;
```

## 🔧 **Environment Configuration Fix**

### **Update `.env.local`** (if needed)
```bash
# Ensure these are correct (replace with your actual values)
UPLOADTHING_SECRET=your_uploadthing_secret_key_here
UPLOADTHING_APP_ID=your_uploadthing_app_id_here  
UPLOADTHING_TOKEN=your_uploadthing_token_here

# Add this for better local development
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 🚀 **Test the Fixes**

### **1. Run Connectivity Test**
```bash
# Load this in browser console:
node diagnose-uploadthing.js
```

### **2. Test Enhanced Upload**
```bash
# Your site should now use the enhanced client automatically
# Try uploading images in admin dashboard
# Watch for retry messages in console
```

### **3. Monitor Network Tab**
- Open Developer Tools → Network
- Try upload
- Look for multiple retry attempts
- Check if requests eventually succeed

## ⚠️ **Fallback Strategy** (If Still Failing)

If UploadThing remains unreachable, I can implement:

1. **Base64 Fallback**: Store images as base64 temporarily
2. **Local File Server**: Upload to your own server first
3. **Queue System**: Queue uploads for retry when connection improves
4. **Alternative CDN**: Switch to Cloudinary or AWS S3

## 📊 **Expected Results**

After applying these fixes, you should see:

✅ **Successful uploads** with retry logic
✅ **Detailed error messages** instead of generic timeouts  
✅ **Network status feedback** in console
✅ **Automatic fallback** for temporary network issues

## 🆘 **If Nothing Works**

The issue might be:
1. **UploadThing server outage** - Check their status page
2. **ISP blocking UploadThing** - Try mobile data
3. **Regional connectivity issues** - UploadThing SEA1 server problems
4. **Account/API key issues** - Contact UploadThing support

**Contact UploadThing Support**: support@uploadthing.com with your error logs.

## ✅ **Quick Action Plan**

1. **Restart dev server** (`npm run dev`)
2. **Test with mobile hotspot** (bypass network issues)  
3. **Run diagnostics** (`runUploadThingDiagnostics()` in console)
4. **Try enhanced upload client** (automatic with current setup)
5. **Check console for retry messages**

Your enhanced upload system will now automatically handle temporary network issues and provide much better error reporting!

---

**💡 Pro Tip**: The enhanced client will show retry attempts in console like:
```
📤 Upload attempt 1/3 for 1 files
❌ Upload attempt 1 failed: Transport error
⏳ Retrying in 1000ms... (attempt 2/3)
✅ Upload successful on attempt 2
```