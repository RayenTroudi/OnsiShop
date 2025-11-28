'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import { useRef, useState } from 'react';

interface VideoUploadProps {
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  className = '',
  acceptedTypes = ['video/mp4', 'video/webm', 'video/ogg'],
  maxSizeMB = 50
}) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      const error = `Invalid file type. Accepted: ${acceptedTypes.join(', ')}`;
      onUploadError?.(error);
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const error = `File too large. Maximum size: ${maxSizeMB}MB`;
      onUploadError?.(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch('/api/appwrite/upload/video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setUploadProgress(100);
      
      setTimeout(() => {
        onUploadSuccess?.(result.url);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error: any) {
      setIsUploading(false);
      setUploadProgress(0);
      onUploadError?.(error.message || 'Upload failed');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        handleFileSelect(file);
      }
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      <div
        className={`
          border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}
          cursor-pointer
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isUploading ? openFileDialog : undefined}
      >
        {isUploading ? (
          <div className="text-center">
            <div className="animate-spin mx-auto mb-4 w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-sm font-medium text-gray-700 mb-2">Uploading video...</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{Math.round(uploadProgress)}%</p>
          </div>
        ) : (
          <div className="text-center">
            <svg 
              className="mx-auto mb-4 w-12 h-12 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Drop a video file here, or click to select
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: MP4, WebM, OGG • Max size: {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {dragActive && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-500 rounded-lg flex items-center justify-center">
          <p className="text-blue-600 font-medium">Drop video here</p>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;