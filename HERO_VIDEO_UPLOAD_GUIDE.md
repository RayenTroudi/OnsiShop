# Hero Video Upload - Simplified Admin Guide

## 🎯 Overview
The video upload system has been optimized for single hero section video management. This ensures optimal performance and eliminates complexity.

## 🚀 Quick Start

### 1. Access Admin Panel
- Visit: https://onsi-shop.vercel.app/admin/content
- Login: `admin@gmail.com` / `admin@gmail.com`

### 2. Navigate to Hero Video
- Click the **"Hero Video"** tab in the admin interface
- This dedicated section manages only the homepage hero background video

### 3. Upload Video
- Click the upload area or drag & drop your video file
- **Supported formats:** MP4, WebM, OGG
- **Maximum size:** 5MB (optimized for web performance)
- **Recommended resolution:** 1920x1080 or 1280x720
- **Recommended duration:** 10-30 seconds

## ✨ Key Features

### 🎛️ Simplified Interface
- **Single video focus:** Only one hero video at a time
- **Clean UI:** Removed unnecessary sections and complexity
- **Real-time preview:** See your video immediately after upload

### 🚀 Performance Optimizations
- **Automatic cleanup:** Old videos are automatically removed when uploading new ones
- **Size limits:** 5MB limit ensures fast loading times
- **Format validation:** Recommends MP4/WebM for best compatibility
- **Instant updates:** Changes appear on the website immediately

### 📊 Upload Process
1. **File validation** - Checks format and size
2. **Progress tracking** - Visual upload progress indicator
3. **Automatic processing** - Converts and optimizes for web
4. **Content update** - Updates hero section automatically
5. **Old cleanup** - Removes previous videos to save space

## 🔧 Technical Details

### API Endpoints
- **Upload:** `POST /api/admin/media` (with section=hero)
- **List:** `GET /api/admin/media`
- **Delete:** `DELETE /api/admin/media/[id]`

### Content Management
- **Content key:** `hero_background_video`
- **Auto-update:** Content key is automatically updated on upload
- **Real-time:** Uses Server-Sent Events for instant updates

### File Handling
- **Storage:** Base64 encoded in database (files under 5MB)
- **Validation:** Type, size, and format checking
- **Optimization:** Automatic cleanup of old files

## 🎯 Best Practices

### Video Preparation
1. **Compress your video** before uploading using online tools
2. **Keep it short** (10-30 seconds) for better user experience
3. **Use MP4 format** for maximum compatibility
4. **Test on mobile** - ensure it looks good on all devices

### Content Strategy
- **Visual appeal:** Choose videos that complement your brand
- **Loading speed:** Shorter, smaller files load faster
- **Mobile-first:** Consider mobile users when selecting videos
- **Accessibility:** Ensure videos enhance rather than distract

## 🔍 Troubleshooting

### Common Issues
- **File too large:** Compress video to under 5MB
- **Wrong format:** Use MP4, WebM, or OGG
- **Upload fails:** Check internet connection and try again
- **Video not showing:** Clear browser cache and refresh

### Error Messages
- **"File too large":** Reduce file size below 5MB
- **"Invalid format":** Convert to supported format
- **"Upload failed":** Check network and try again

## 📱 Mobile Considerations
- Videos autoplay muted on mobile devices
- Keep file sizes small for mobile data usage
- Test video appearance on various screen sizes
- Consider using images as fallbacks

## 🛡️ Security & Performance
- Files are validated before upload
- Only authenticated admins can upload
- Automatic cleanup prevents storage bloat
- Real-time updates without page refresh

---

## 🎉 Summary
The simplified hero video upload system provides:
- ✅ **Single-purpose interface** for hero videos only
- ✅ **Automatic optimization** and cleanup
- ✅ **Real-time updates** without complexity
- ✅ **Performance-focused** with 5MB limits
- ✅ **User-friendly** with progress indicators

Ready to upload your hero video! 🚀