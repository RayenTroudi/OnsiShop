"use client";

import { formatFileSize } from "@/lib/uploadService";
import type { OurFileRouter } from "@/lib/uploadthing";
import { UploadButton, UploadDropzone } from "@uploadthing/react";
import { useState } from "react";

// Upload progress component
const UploadProgress = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
      style={{ width: `${progress}%` }}
    />
    <div className="text-center text-sm text-gray-600 mt-2">
      {progress}% uploaded
    </div>
  </div>
);

// Upload error component
const UploadError = ({ error, onRetry }: { error: string; onRetry?: () => void }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-red-800">Upload Failed</h3>
        <p className="text-sm text-red-700 mt-1">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </div>
);

// Upload success component
const UploadSuccess = ({ fileUrl, fileName, fileSize }: { 
  fileUrl: string; 
  fileName: string;
  fileSize: number;
}) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-green-800">Upload Successful</h3>
        <div className="text-sm text-green-700 mt-1">
          <p className="font-medium">{fileName}</p>
          <p className="text-xs text-gray-600">{formatFileSize(fileSize)}</p>
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-xs"
          >
            View file →
          </a>
        </div>
      </div>
    </div>
  </div>
);

interface FileUploaderProps {
  endpoint: keyof OurFileRouter;
  onUploadComplete?: (res: any) => void;
  onUploadError?: (error: Error) => void;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
  variant?: 'dropzone' | 'button';
  children?: React.ReactNode;
}

export default function FileUploader({
  endpoint,
  onUploadComplete,
  onUploadError,
  maxFiles = 1,
  className = "",
  disabled = false,
  variant = "dropzone",
  children
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
  } | null>(null);

  const handleUploadBegin = () => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(null);
    console.log("📤 Upload started to UploadThing...");
    console.log("🎯 Endpoint:", endpoint);
  };

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  const handleUploadComplete = (res: any) => {
    setIsUploading(false);
    
    console.log("🔍 FileUploader received upload result:", res);
    
    if (res && res[0]) {
      const file = res[0];
      console.log("📄 File object from UploadThing:", file);
      
      // Validate that we received a proper UploadThing URL
      if (file.url?.startsWith('data:')) {
        console.error("❌ FileUploader received base64 data URL instead of UploadThing URL");
        setUploadError("Upload failed: Invalid file URL format received.");
        return;
      }
      
      if (!file.url?.includes('uploadthing') && !file.url?.includes('utfs.io')) {
        console.error("❌ FileUploader: URL doesn't appear to be from UploadThing:", file.url);
        setUploadError("Upload failed: Invalid file URL received from server.");
        return;
      }
      
      setUploadSuccess({
        fileUrl: file.url,
        fileName: file.name,
        fileSize: file.size
      });
      
      console.log("✅ FileUploader: Valid upload completed:", file.url);
      onUploadComplete?.(res);
    } else {
      console.error("❌ FileUploader: No valid file data in response");
      setUploadError("Upload failed: No file information received.");
    }
  };

  const handleUploadError = (error: Error) => {
    setIsUploading(false);
    setUploadError(error.message);
    console.error("❌ Upload error:", error);
    onUploadError?.(error);
  };

  const handleRetry = () => {
    setUploadError(null);
    setUploadSuccess(null);
  };

  const commonProps = {
    endpoint,
    onClientUploadComplete: handleUploadComplete,
    onUploadError: handleUploadError,
    onUploadBegin: handleUploadBegin,
    onUploadProgress: handleUploadProgress,
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Status Messages */}
      {uploadError && (
        <UploadError error={uploadError} onRetry={handleRetry} />
      )}
      
      {uploadSuccess && !uploadError && (
        <UploadSuccess 
          fileUrl={uploadSuccess.fileUrl}
          fileName={uploadSuccess.fileName}
          fileSize={uploadSuccess.fileSize}
        />
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <UploadProgress progress={uploadProgress} />
        </div>
      )}

      {/* Upload Component */}
      {!disabled && !uploadSuccess && (
        <div className="space-y-4">
          {variant === 'dropzone' ? (
            <UploadDropzone<OurFileRouter, typeof endpoint>
              {...commonProps}
              appearance={{
                container: "border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors",
                uploadIcon: "text-gray-400",
                label: "text-gray-600 font-medium",
                allowedContent: "text-gray-500 text-sm",
                button: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors ut-ready:bg-blue-600 ut-uploading:bg-blue-400 ut-uploading:cursor-not-allowed"
              }}
            />
          ) : (
            <div className="text-center">
              <UploadButton<OurFileRouter, typeof endpoint>
                {...commonProps}
                appearance={{
                  button: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors ut-ready:bg-blue-600 ut-uploading:bg-blue-400 ut-uploading:cursor-not-allowed",
                  allowedContent: "text-gray-500 text-sm mt-2"
                }}
              />
            </div>
          )}
          
          {children && (
            <div className="text-center text-sm text-gray-600">
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
}