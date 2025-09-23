"use client";

import FileUploader from '@/components/upload/FileUploader';
import { useState } from 'react';

interface VideoUploaderProps {
  onUploadComplete?: (url: string) => void;
  currentVideoUrl?: string;
  title?: string;
  description?: string;
  maxSize?: string;
  className?: string;
  autoSaveToDatabase?: boolean; // New prop to control automatic database saving
  contentKey?: string; // Content key for database storage
}

export default function VideoUploader({ 
  onUploadComplete,
  currentVideoUrl,
  title = "Upload Video",
  description = "Select a video file to upload",
  maxSize = "32MB",
  className = "",
  autoSaveToDatabase = false,
  contentKey = "hero_background_video"
}: VideoUploaderProps) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleUploadComplete = async (res: any) => {
    console.log("🔍 Raw upload response:", res);
    
    if (res?.[0]) {
      const uploadResult = res[0];
      console.log("📄 Upload result object:", uploadResult);
      
      // Validate that we have a proper UploadThing URL
      const newUrl = uploadResult.url;
      console.log("🔗 Extracted URL:", newUrl);
      
      // Check if the URL is a base64 data URL (which shouldn't happen with UploadThing)
      if (newUrl?.startsWith('data:')) {
        console.error("❌ Received base64 data URL instead of UploadThing URL:", newUrl.substring(0, 100) + "...");
        setSaveError("❌ Upload error: Received invalid URL format. Please try again.");
        return;
      }
      
      // Check if it's a proper UploadThing URL
      if (!newUrl?.includes('uploadthing') && !newUrl?.includes('utfs.io')) {
        console.error("❌ URL doesn't appear to be from UploadThing:", newUrl);
        setSaveError("❌ Upload error: Invalid file URL received. Please try again.");
        return;
      }
      
      console.log("✅ Valid UploadThing URL received:", newUrl);
      
      setUploadedUrl(newUrl);
      setSaveError(null);
      setSaveSuccess(false);

      // If autoSaveToDatabase is enabled, save to database automatically
      if (autoSaveToDatabase) {
        await saveToDatabase(newUrl, uploadResult);
      } else {
        // Otherwise, just call the callback
        onUploadComplete?.(newUrl);
      }
    } else {
      console.error("❌ No upload result received:", res);
      setSaveError("❌ Upload failed: No file information received.");
    }
  };

  const saveToDatabase = async (videoUrl: string, uploadResult: any) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      console.log("💾 Saving video URL to database:", videoUrl);

      const response = await fetch('/api/admin/hero-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          videoUrl,
          uploadId: uploadResult.uploadId || uploadResult.key,
          metadata: {
            fileName: uploadResult.name || 'unknown',
            fileSize: uploadResult.size || 0,
            uploadedAt: new Date().toISOString(),
            contentKey
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 503 && result.retryable) {
          setSaveError(`⚠️ Database timeout occurred. Your video was uploaded successfully. The system will retry automatically, or you can refresh the page.`);
        } else {
          throw new Error(result.message || result.error || 'Failed to save video to database');
        }
        return;
      }

      if (result.success) {
        setSaveSuccess(true);
        console.log("✅ Video URL saved to database successfully");
        
        // Call the completion callback
        onUploadComplete?.(videoUrl);
        
        // Clear success message after a few seconds
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        throw new Error(result.message || 'Failed to save video');
      }

    } catch (error: any) {
      console.error("❌ Failed to save video to database:", error);
      
      const isNetworkError = error.message?.includes('timeout') || 
                            error.message?.includes('fetch') ||
                            error.message?.includes('network');
      
      if (isNetworkError) {
        setSaveError(`🔄 Network timeout occurred. Your video was uploaded successfully. Please refresh the page to verify the update.`);
      } else {
        setSaveError(`❌ ${error.message || 'Failed to save video to database'}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadError = (error: Error) => {
    console.error("❌ Video upload error:", error);
    setSaveError(`Upload failed: ${error.message}`);
  };

  const videoUrl = uploadedUrl || currentVideoUrl;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        {autoSaveToDatabase && (
          <p className="text-xs text-blue-600 mt-1">
            ✨ Videos are automatically saved to your database after upload
          </p>
        )}
      </div>

      {/* Save Status Messages */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-700">{saveError}</p>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-green-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                ✅ Video uploaded and saved successfully! Your homepage video is now live.
              </p>
            </div>
          </div>
        </div>
      )}

      {isSaving && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="ml-3 text-blue-800 font-medium">💾 Saving video to database...</p>
          </div>
        </div>
      )}

      {/* Current Video Preview */}
      {videoUrl && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            {uploadedUrl ? "✅ Newly Uploaded Video" : "Current Video"}
          </h4>
          
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            {isPreviewLoading && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <div className="text-gray-500">Loading video...</div>
              </div>
            )}
            
            <video 
              src={videoUrl}
              controls 
              className="w-full max-w-2xl rounded-lg shadow-lg"
              style={{ maxHeight: '400px' }}
              onLoadStart={() => setIsPreviewLoading(true)}
              onCanPlay={() => setIsPreviewLoading(false)}
              onError={() => {
                setIsPreviewLoading(false);
                console.error("Error loading video preview");
              }}
              preload="metadata"
            />
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>URL:</strong> {videoUrl}</p>
            <p><strong>Status:</strong> {uploadedUrl ? "Ready to use" : "Currently active"}</p>
          </div>
        </div>
      )}

      {/* Upload Component */}
      <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
        <FileUploader
          endpoint="heroVideoUploader"
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          variant="dropzone"
          maxFiles={1}
        >
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Drag and drop your video file here, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Maximum file size: {maxSize} • Supported formats: MP4, WebM, MOV
            </p>
          </div>
        </FileUploader>
      </div>

      {/* Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Video Upload Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Recommended resolution:</strong> 1920x1080 (Full HD) or higher</li>
          <li>• <strong>Recommended duration:</strong> 15-60 seconds for homepage videos</li>
          <li>• <strong>File formats:</strong> MP4 (recommended), WebM, MOV</li>
          <li>• <strong>Compression:</strong> Videos are automatically optimized for web delivery</li>
          <li>• <strong>Performance:</strong> Files served from global CDN for fast loading</li>
        </ul>
      </div>

    </div>
  );
}