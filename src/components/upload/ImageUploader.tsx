"use client";

import FileUploader from '@/components/upload/FileUploader';
import { formatFileSize } from '@/lib/uploadService';
import { useState } from 'react';

interface ImageUploaderProps {
  onUploadComplete?: (urls: string[]) => void;
  currentImages?: string[];
  maxFiles?: number;
  title?: string;
  description?: string;
  className?: string;
}

export default function ImageUploader({ 
  onUploadComplete,
  currentImages = [],
  maxFiles = 5,
  title = "Upload Images",
  description = "Select image files to upload",
  className = ""
}: ImageUploaderProps) {
  const [uploadedImages, setUploadedImages] = useState<Array<{
    url: string;
    name: string;
    size: number;
  }>>([]);

  const handleUploadComplete = (res: any) => {
    if (res && Array.isArray(res)) {
      const newImages = res.map(file => ({
        url: file.url,
        name: file.name,
        size: file.size
      }));
      
      setUploadedImages(prev => [...prev, ...newImages]);
      
      // Call callback with all URLs
      const allUrls = [...currentImages, ...uploadedImages.map(img => img.url), ...newImages.map(img => img.url)];
      onUploadComplete?.(allUrls);
      
      console.log("✅ Images uploaded successfully:", newImages.length);
    }
  };

  const handleUploadError = (error: Error) => {
    console.error("❌ Image upload error:", error);
    alert(`Upload failed: ${error.message}`);
  };

  const removeImage = (index: number, isUploaded: boolean = false) => {
    if (isUploaded) {
      const newUploaded = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newUploaded);
      
      const allUrls = [...currentImages, ...newUploaded.map(img => img.url)];
      onUploadComplete?.(allUrls);
    } else {
      // Handle removing current images if needed
      const newCurrent = currentImages.filter((_, i) => i !== index);
      const allUrls = [...newCurrent, ...uploadedImages.map(img => img.url)];
      onUploadComplete?.(allUrls);
    }
  };

  const totalImages = currentImages.length + uploadedImages.length;
  const canUploadMore = totalImages < maxFiles;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-500 mt-1">
          {totalImages} of {maxFiles} images • {maxFiles - totalImages} remaining
        </p>
      </div>

      {/* Current Images */}
      {currentImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Current Images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentImages.map((url, index) => (
              <div key={`current-${index}`} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={url}
                    alt={`Current image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <button
                  onClick={() => removeImage(index, false)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Newly Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-green-800">✅ Newly Uploaded Images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={`uploaded-${index}`} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-green-200">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <button
                  onClick={() => removeImage(index, true)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  ×
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="truncate">{image.name}</p>
                  <p>{formatFileSize(image.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Component */}
      {canUploadMore && (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
          <FileUploader
            endpoint="productImageUploader"
            onUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            variant="dropzone"
            maxFiles={maxFiles - totalImages}
          >
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Drag and drop your images here, or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Maximum {maxFiles - totalImages} more images • Max 4MB each • JPG, PNG, WebP, GIF
              </p>
            </div>
          </FileUploader>
        </div>
      )}

      {/* Upload limit reached */}
      {!canUploadMore && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Maximum number of images reached ({maxFiles})
              </p>
              <p className="text-sm text-yellow-700">
                Remove some images to upload new ones.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">📋 Image Upload Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Recommended size:</strong> 800x800px or larger (square aspect ratio preferred)</li>
          <li>• <strong>File formats:</strong> JPG, PNG, WebP, GIF</li>
          <li>• <strong>File size limit:</strong> 4MB per image</li>
          <li>• <strong>Quality:</strong> Use high-quality images for better customer experience</li>
          <li>• <strong>Optimization:</strong> Images are automatically optimized for web delivery</li>
        </ul>
      </div>
    </div>
  );
}