"use client";

import { useState } from "react";

interface AppwriteFileUploaderProps {
  uploadType?: 'image' | 'video' | 'general';
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: Error) => void;
  maxFiles?: number;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
}

export default function AppwriteFileUploader({
  uploadType = 'general',
  onUploadComplete,
  onUploadError,
  maxFiles = 1,
  accept,
  maxSizeMB = 32,
  className = "",
  disabled = false,
}: AppwriteFileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<any | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const getApiEndpoint = () => {
    switch (uploadType) {
      case 'image':
        return '/api/appwrite/upload/image';
      case 'video':
        return '/api/appwrite/upload/video';
      default:
        return '/api/appwrite/upload';
    }
  };

  const getAcceptedTypes = () => {
    if (accept) return accept;
    
    switch (uploadType) {
      case 'image':
        return 'image/jpeg,image/png,image/webp,image/gif';
      case 'video':
        return 'video/mp4,video/webm,video/ogg,video/quicktime';
      default:
        return 'image/*,video/*,application/pdf';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;
    
    // Validate file count
    if (files.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} file(s) allowed`);
      return;
    }

    // Validate file sizes
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const oversizedFiles = files.filter(f => f.size > maxSizeBytes);
    
    if (oversizedFiles.length > 0) {
      setUploadError(`File(s) too large. Maximum size: ${maxSizeMB}MB`);
      return;
    }

    setSelectedFiles(files);
    setUploadError(null);
    setUploadSuccess(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const uploadResults = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const formData = new FormData();
        
        // Use appropriate key based on upload type
        const fileKey = uploadType === 'image' ? 'image' : uploadType === 'video' ? 'video' : 'file';
        formData.append(fileKey, file);
        formData.append('uploadType', uploadType);

        const response = await fetch(getApiEndpoint(), {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();
        uploadResults.push(result);

        // Update progress
        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      setUploadSuccess(uploadResults.length === 1 ? uploadResults[0] : uploadResults);
      setSelectedFiles([]);
      
      onUploadComplete?.(uploadResults.length === 1 ? uploadResults[0] : uploadResults);

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Upload failed');
      onUploadError?.(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.dataTransfer.files);
    
    // Create a synthetic event to reuse the validation logic
    const syntheticEvent = {
      target: { files }
    } as any;

    handleFileSelect(syntheticEvent);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Status Messages */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Upload Failed</h3>
              <p className="text-sm text-red-700 mt-1">{uploadError}</p>
            </div>
          </div>
        </div>
      )}
      
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-green-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">Upload Successful</h3>
              <div className="text-sm text-green-700 mt-1">
                {Array.isArray(uploadSuccess) ? (
                  <p>{uploadSuccess.length} file(s) uploaded</p>
                ) : (
                  <>
                    <p className="font-medium">{uploadSuccess.filename}</p>
                    <p className="text-xs text-gray-600">{formatFileSize(uploadSuccess.size)}</p>
                    <a 
                      href={uploadSuccess.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-xs"
                    >
                      View file →
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-600">
            {Math.round(uploadProgress)}% uploaded
          </div>
        </div>
      )}

      {/* Dropzone */}
      {!disabled && !uploadSuccess && (
        <div
          className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors rounded-lg p-8"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            <div className="mt-4">
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-block"
              >
                Choose file{maxFiles > 1 ? 's' : ''}
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileSelect}
                  accept={getAcceptedTypes()}
                  multiple={maxFiles > 1}
                  disabled={isUploading}
                />
              </label>
            </div>
            
            <p className="mt-2 text-sm text-gray-600">or drag and drop</p>
            <p className="mt-1 text-xs text-gray-500">
              Maximum file size: {maxSizeMB}MB
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{formatFileSize(file.size)}</span>
                </div>
              ))}
              
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
