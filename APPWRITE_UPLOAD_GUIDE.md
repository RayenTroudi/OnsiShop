# Appwrite Storage Upload System

This document explains the new Appwrite Storage upload system that replaces UploadThing.

## Overview

All file uploads now use Appwrite Cloud Storage (Bucket ID: `69270279001498a920cf`) instead of UploadThing.

## API Endpoints

### 1. Video Upload
**Endpoint:** `POST /api/appwrite/upload/video`

**FormData Fields:**
- `video`: File (required)

**Max Size:** 32MB

**Allowed Types:** MP4, WebM, OGG, MOV

**Response:**
```json
{
  "success": true,
  "url": "https://fra.cloud.appwrite.io/v1/storage/buckets/.../files/.../view?project=...",
  "fileId": "unique-file-id",
  "filename": "video.mp4",
  "size": 12345678,
  "type": "video/mp4",
  "message": "Video uploaded successfully to Appwrite Storage"
}
```

### 2. Image Upload
**Endpoint:** `POST /api/appwrite/upload/image`

**FormData Fields:**
- `image`: File (required)

**Max Size:** 8MB

**Allowed Types:** JPEG, PNG, WebP, GIF

**Response:**
```json
{
  "success": true,
  "url": "https://fra.cloud.appwrite.io/v1/storage/buckets/.../files/.../view?project=...",
  "fileId": "unique-file-id",
  "filename": "image.png",
  "size": 123456,
  "type": "image/png",
  "message": "Image uploaded successfully to Appwrite Storage"
}
```

### 3. General File Upload
**Endpoint:** `POST /api/appwrite/upload`

**FormData Fields:**
- `file`: File (required)
- `uploadType`: String (optional, default: 'general-media')

**Max Size:** 32MB

**Allowed Types:** Images, Videos, PDFs

**Response:**
```json
{
  "success": true,
  "url": "https://fra.cloud.appwrite.io/v1/storage/buckets/.../files/.../view?project=...",
  "fileId": "unique-file-id",
  "filename": "document.pdf",
  "size": 234567,
  "type": "application/pdf",
  "uploadId": "database-record-id",
  "message": "File uploaded successfully to Appwrite Storage"
}
```

## Components

### AppwriteFileUploader
New React component for uploading files to Appwrite Storage.

**Usage:**
```tsx
import AppwriteFileUploader from '@/components/upload/AppwriteFileUploader';

<AppwriteFileUploader
  uploadType="image" // or "video" or "general"
  onUploadComplete={(result) => console.log('Uploaded:', result)}
  onUploadError={(error) => console.error('Error:', error)}
  maxFiles={1}
  maxSizeMB={8}
/>
```

**Props:**
- `uploadType`: 'image' | 'video' | 'general' (default: 'general')
- `onUploadComplete`: (result: any) => void
- `onUploadError`: (error: Error) => void
- `maxFiles`: number (default: 1)
- `accept`: string (optional, auto-detected from uploadType)
- `maxSizeMB`: number (default: 32)
- `className`: string
- `disabled`: boolean

### VideoUploader
Updated to use Appwrite Storage instead of UploadThing.

**Usage:**
```tsx
import VideoUploader from '@/components/upload/VideoUploader';

<VideoUploader
  currentVideoUrl={currentUrl}
  onUploadComplete={(url) => console.log('Video URL:', url)}
  autoSaveToDatabase={true}
  contentKey="hero_background_video"
  title="Homepage Hero Video"
  description="Upload video for hero section"
  maxSize="32MB"
/>
```

## Server-Side Upload Service

### Storage Service (`src/lib/appwrite/storage.ts`)

**Upload from Buffer:**
```typescript
import { uploadFile } from '@/lib/appwrite/storage';

const result = await uploadFile(buffer, 'filename.mp4', 'video/mp4');
console.log(result.fileId, result.url);
```

**Upload from FormData:**
```typescript
import { uploadFromFormData } from '@/lib/appwrite/storage';

const result = await uploadFromFormData(formData, 'file');
console.log(result);
```

**Get File URL:**
```typescript
import { getFileUrl } from '@/lib/appwrite/storage';

const url = getFileUrl('file-id-here');
```

**Get File Preview (Images):**
```typescript
import { getFilePreviewUrl } from '@/lib/appwrite/storage';

const previewUrl = getFilePreviewUrl('file-id', 400, 400);
```

**Delete File:**
```typescript
import { deleteFile } from '@/lib/appwrite/storage';

await deleteFile('file-id-here');
```

## Upload Service (`src/lib/uploadService.ts`)

The UploadService now automatically saves metadata to the `uploads` collection in Appwrite database.

**Important:** When saving metadata with objects, they are automatically converted to JSON strings:

```typescript
import { UploadService } from '@/lib/uploadService';

await UploadService.saveUpload({
  fileName: 'video.mp4',
  fileUrl: 'https://...',
  fileSize: 12345678,
  fileType: 'video/mp4',
  uploadedBy: userId,
  uploadType: 'hero-video',
  isPublic: true,
  metadata: JSON.stringify({  // Must be stringified!
    fileId: 'appwrite-file-id',
    originalName: 'original.mp4',
    tags: ['hero', 'video']
  })
});
```

## Migration from UploadThing

### Before (UploadThing):
```tsx
import FileUploader from '@/components/upload/FileUploader';

<FileUploader
  endpoint="heroVideoUploader"
  onUploadComplete={(res) => console.log(res)}
  variant="dropzone"
/>
```

### After (Appwrite):
```tsx
import AppwriteFileUploader from '@/components/upload/AppwriteFileUploader';

<AppwriteFileUploader
  uploadType="video"
  onUploadComplete={(result) => console.log(result)}
  maxFiles={1}
/>
```

## Benefits

✅ **No Third-Party Dependency:** All files stored in your Appwrite instance  
✅ **Better Control:** Full control over file storage and permissions  
✅ **Cost Effective:** No additional service fees beyond Appwrite  
✅ **Integrated:** Files and metadata in same infrastructure  
✅ **Secure:** Admin-only upload endpoints with authentication  
✅ **Fast:** Served from Appwrite CDN  

## File URLs

Appwrite Storage URLs follow this format:
```
https://fra.cloud.appwrite.io/v1/storage/buckets/{bucketId}/files/{fileId}/view?project={projectId}
```

For image previews with transformations:
```
https://fra.cloud.appwrite.io/v1/storage/buckets/{bucketId}/files/{fileId}/preview?width=400&height=400&quality=80&project={projectId}
```

## Testing

1. Login as admin: `admin@onsishop.com` / `Admin123!@#`
2. Navigate to `/admin/hero-video`
3. Upload a video file (MP4, WebM, MOV)
4. Video should upload to Appwrite Storage and save metadata to database
5. Video URL should be displayed and playable

## Troubleshooting

**Error: "Admin access required"**
- Make sure you're logged in as admin
- Check JWT token is valid in cookies

**Error: "File too large"**
- Videos: max 32MB
- Images: max 8MB
- Compress files if needed

**Error: "Invalid file type"**
- Check file extension and MIME type
- Ensure file matches allowed types for endpoint

**Upload succeeds but doesn't appear**
- Check browser console for errors
- Verify metadata is being saved to database
- Check Appwrite Console for file in bucket

## Configuration

Bucket ID is configured in `.env.local`:
```env
NEXT_PUBLIC_APPWRITE_BUCKET_ID=69270279001498a920cf
```

This is automatically used by all upload functions.
