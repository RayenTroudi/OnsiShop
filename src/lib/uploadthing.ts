import { verifyAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UploadService } from "@/lib/uploadService";
import { NextRequest } from "next/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// File size limits (increased to handle typical upload sizes)
const MAX_IMAGE_SIZE = "8MB"; // Increased from 2MB to handle larger images
const MAX_VIDEO_SIZE = "32MB"; // Restored to original size  
const MAX_DOCUMENT_SIZE = "8MB"; // Increased from 4MB

// Allowed file types
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const DOCUMENT_TYPES = ["application/pdf"];

export const ourFileRouter = {
  // Hero video uploader - Admin only
  heroVideoUploader: f({ 
    video: { 
      maxFileSize: MAX_VIDEO_SIZE, 
      maxFileCount: 1,
      acl: "public-read"
    } 
  })
    .middleware(async ({ req }) => {
      const user = verifyAuth(req as NextRequest);
      
      if (!user || !user.isAdmin) {
        throw new UploadThingError("Admin access required");
      }

      return { 
        userId: user.userId,
        email: user.email,
        uploadType: "hero-video",
        isAdmin: true
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("🎥 Hero video upload completed!");
      console.log("📄 File object:", file);
      console.log("🔗 File URL:", file.url);
      console.log("📊 File details:", {
        name: file.name,
        size: file.size,
        type: file.type,
        key: file.key
      });
      
      // Validate that we received a proper UploadThing URL
      if (file.url?.startsWith('data:')) {
        console.error("❌ UploadThing onUploadComplete received base64 data URL instead of proper URL!");
        throw new UploadThingError("Invalid file URL format received");
      }
      
      if (!file.url?.includes('uploadthing') && !file.url?.includes('utfs.io')) {
        console.error("❌ UploadThing URL doesn't appear to be from UploadThing service:", file.url);
        throw new UploadThingError("Invalid UploadThing URL received");
      }
      
      try {
        await connectDB();
        
        // Save upload metadata to database
        const savedUpload = await UploadService.saveUpload({
          fileName: file.name,
          fileUrl: file.url,
          fileSize: file.size,
          fileType: file.type || 'video/mp4',
          uploadedBy: metadata.userId,
          uploadType: "hero-video" as const,
          isPublic: true,
          metadata: {
            originalName: file.name,
            tags: ['hero', 'video', 'homepage']
          }
        });
        
        console.log("📄 Hero video upload saved to DB:", savedUpload._id);
        
        return { 
          uploadedBy: metadata.userId,
          fileUrl: file.url,
          uploadType: "hero-video",
          uploadId: savedUpload._id?.toString() || 'unknown',
          key: file.key,
          name: file.name,
          size: file.size,
          url: file.url
        };
      } catch (error) {
        console.error("❌ Failed to save upload metadata:", error);
        throw new UploadThingError("Failed to save upload metadata");
      }
    }),

  // Product images uploader - Admin only
  productImageUploader: f({ 
    image: { 
      maxFileSize: MAX_IMAGE_SIZE, 
      maxFileCount: 10,
      acl: "public-read"
    } 
  })
    .middleware(async ({ req }) => {
      const user = verifyAuth(req as NextRequest);
      
      if (!user || !user.isAdmin) {
        throw new UploadThingError("Admin access required");
      }

      return { 
        userId: user.userId,
        email: user.email,
        uploadType: "product-image",
        isAdmin: true
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("🖼️ Product image uploaded:", file.url);
      
      try {
        await connectDB();
        
        const savedUpload = await UploadService.saveUpload({
          fileName: file.name,
          fileUrl: file.url,
          fileSize: file.size,
          fileType: file.type || 'image/jpeg',
          uploadedBy: metadata.userId,
          uploadType: "product-image" as const,
          isPublic: true,
          metadata: {
            originalName: file.name,
            tags: ['product', 'image']
          }
        });
        
        console.log("📄 Product image upload saved:", savedUpload._id);
        
        return { 
          uploadedBy: metadata.userId,
          fileUrl: file.url,
          uploadType: "product-image",
          uploadId: savedUpload._id
        };
      } catch (error) {
        console.error("❌ Failed to save upload metadata:", error);
        throw new UploadThingError("Failed to save upload metadata");
      }
    }),

  // General media uploader - Admin only
  mediaUploader: f({ 
    image: { 
      maxFileSize: MAX_IMAGE_SIZE, 
      maxFileCount: 1, // Reduced from 5 to prevent timeout
      acl: "public-read",
      contentDisposition: "inline"
    },
    video: { 
      maxFileSize: "32MB", // Restored to handle larger videos
      maxFileCount: 1, // Reduced from 3 to prevent timeout 
      acl: "public-read",
      contentDisposition: "inline"
    }
  })
    .middleware(async ({ req }) => {
      const user = verifyAuth(req as NextRequest);
      
      if (!user || !user.isAdmin) {
        throw new UploadThingError("Admin access required");
      }

      return { 
        userId: user.userId,
        email: user.email,
        uploadType: "general-media",
        isAdmin: true
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("📁 General media uploaded:", file.url);
      
      // Note: Client-side components will handle saving to media_assets via /api/admin/media-new
      // This callback just confirms the upload succeeded
      console.log("✅ UploadThing upload completed, client will handle database save");
      
      return { 
        uploadedBy: metadata.userId,
        fileUrl: file.url,
        uploadType: "general-media",
        key: file.key,
        name: file.name,
        size: file.size,
        url: file.url
      };
    }),

  // User profile picture uploader - Authenticated users
  avatarUploader: f({ 
    image: { 
      maxFileSize: "2MB", 
      maxFileCount: 1,
      acl: "public-read"
    } 
  })
    .middleware(async ({ req }) => {
      const user = verifyAuth(req as NextRequest);
      
      if (!user) {
        throw new UploadThingError("Authentication required");
      }

      return { 
        userId: user.userId,
        email: user.email,
        uploadType: "avatar",
        isAdmin: user.isAdmin
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("👤 Avatar uploaded:", file.url);
      
      try {
        await connectDB();
        
        const savedUpload = await UploadService.saveUpload({
          fileName: file.name,
          fileUrl: file.url,
          fileSize: file.size,
          fileType: file.type || 'image/jpeg',
          uploadedBy: metadata.userId,
          uploadType: "avatar" as const,
          isPublic: true,
          metadata: {
            originalName: file.name,
            tags: ['avatar', 'profile'],
            relatedId: metadata.userId
          }
        });
        
        console.log("📄 Avatar upload saved:", savedUpload._id);
        
        return { 
          uploadedBy: metadata.userId,
          fileUrl: file.url,
          uploadType: "avatar",
          uploadId: savedUpload._id
        };
      } catch (error) {
        console.error("❌ Failed to save upload metadata:", error);
        throw new UploadThingError("Failed to save upload metadata");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;