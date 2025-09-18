'use client';

import { useRef, useState } from 'react';

interface SimpleMediaUploaderProps {
  section: 'hero' | 'promotions' | 'about' | 'footer' | 'contact';
  mediaType: 'image' | 'video' | 'both';
  currentMedia?: string;
  onUploadSuccess?: (url: string) => void;
  title: string;
  description: string;
}

export default function SimpleMediaUploader({
  section,
  mediaType,
  currentMedia,
  onUploadSuccess,
  title,
  description
}: SimpleMediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptTypes = () => {
    if (mediaType === 'image') return 'image/*';
    if (mediaType === 'video') return 'video/*';
    return 'image/*,video/*';
  };

  const validateFile = (file: File): string | null => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (mediaType === 'image' && !isImage) {
      return 'Please upload an image file (JPG, PNG, GIF, WebP)';
    }
    
    if (mediaType === 'video' && !isVideo) {
      return 'Please upload a video file (MP4, WebM, OGG)';
    }
    
    if (!isImage && !isVideo) {
      return 'Please upload a valid image or video file';
    }
    
    const maxSizeMB = 5;
    const fileSizeMB = file.size / (1024 * 1024);
    
    if (fileSizeMB > maxSizeMB) {
      return `File too large. Maximum size is ${maxSizeMB}MB. Current size: ${Math.round(fileSizeMB * 100) / 100}MB`;
    }
    
    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('section', section);
      formData.append('alt', `${section} ${mediaType}`);

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onUploadSuccess?.(result.url);
        
        // Show success message
        const fileName = file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name;
        alert(`✅ ${fileName} uploaded successfully!\n\nYour ${mediaType} will appear on the website immediately.`);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or use a smaller file.`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      uploadFile(files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      {/* Current Media Preview */}
      {currentMedia && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Current {mediaType}:</p>
          <div className="border border-gray-200 rounded-lg overflow-hidden max-w-sm">
            {mediaType === 'video' || currentMedia.includes('video') ? (
              <video 
                src={currentMedia} 
                className="w-full h-32 object-cover"
                muted
                controls={false}
              />
            ) : (
              <img 
                src={currentMedia} 
                alt={`Current ${section} ${mediaType}`}
                className="w-full h-32 object-cover"
              />
            )}
          </div>
        </div>
      )}
      
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none opacity-75' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptTypes()}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-blue-600 font-semibold">Uploading...</p>
            <p className="text-gray-500 text-sm">Please wait</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gray-100">
              {mediaType === 'video' ? (
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              ) : mediaType === 'image' ? (
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              {dragActive ? 'Drop here!' : 'Click or drag to upload'}
            </p>
            <p className="text-gray-600 mb-2">
              {mediaType === 'video' ? 'MP4, WebM, OGG' : mediaType === 'image' ? 'JPG, PNG, GIF, WebP' : 'Images or Videos'}
            </p>
            <p className="text-sm text-gray-500">Maximum size: 5MB</p>
          </div>
        )}
      </div>
      
      {/* Guidelines */}
      <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
        <h4 className="font-medium text-blue-900 mb-1">Tips for best results:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          {mediaType === 'video' ? (
            <>
              <li>• Use MP4 format for best compatibility</li>
              <li>• Keep videos under 30 seconds for optimal loading</li>
              <li>• Recommended resolution: 1920x1080 or 1280x720</li>
            </>
          ) : mediaType === 'image' ? (
            <>
              <li>• Use JPG or PNG for photos</li>
              <li>• Recommended size: 1920x1080 for best quality</li>
              <li>• WebP format offers smallest file sizes</li>
            </>
          ) : (
            <>
              <li>• Images: JPG, PNG, WebP recommended</li>
              <li>• Videos: MP4 format for best compatibility</li>
              <li>• Keep files under 5MB for fast loading</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}