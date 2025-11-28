'use client';

import AppwriteFileUploader from '@/components/upload/AppwriteFileUploader';
import VideoUploader from '@/components/upload/VideoUploader';
import { useState } from 'react';

interface SimpleMediaUploaderProps {
  section: 'hero' | 'promotions' | 'footer' | 'contact';
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
  const [justUploaded, setJustUploaded] = useState<string | null>(null);

  const handleAppwriteUploadComplete = async (url: string) => {
    console.log(`Upload completed: ${url}`);
    
    try {
      // Validate the URL is from Appwrite
      const isAppwrite = url.includes('appwrite.io') || url.includes('/storage/buckets/');
      
      if (!isAppwrite) {
        console.error('Invalid URL received - not from Appwrite:', url);
        alert('Upload Error: Invalid URL format received. Please try again.');
        return;
      }

      // Save the URL to the appropriate content key
      const contentKey = getContentKey();
      if (contentKey) {
        console.log(`Saving URL to content key: ${contentKey}`);
        
        // Use unified API endpoint for all media (handles both content updates and media assets)
        const response = await fetch('/api/admin/media-new', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            section,
            mediaType,
            contentKey
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ URL and media asset saved successfully:', result);
          
          onUploadSuccess?.(url);
          setJustUploaded(url.split('/').pop() || 'File uploaded');
          setTimeout(() => setJustUploaded(null), 5000);
          
          console.log(`${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} uploaded and saved successfully!`);
        } else {
          const errorData = await response.json();
          console.error('Failed to save Appwrite Storage URL:', errorData);
          alert(`⚠️ Upload completed but failed to save to database: ${errorData.message || errorData.error || 'Unknown error'}`);
        }
      } else {
        console.warn('No content key determined for:', { section, mediaType });
        alert(`⚠️ Upload completed but no content key configured for ${section} ${mediaType}`);
      }
    } catch (error) {
      console.error('Error saving Appwrite Storage URL:', error);
      alert(`❌ Error saving upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getContentKey = () => {
    if (section === 'hero' && mediaType === 'video') return 'hero_background_video';
    if (section === 'hero' && mediaType === 'image') return 'hero_background_image';
    if (section === 'promotions' && mediaType === 'image') return 'promotion_background_image';
    return null;
  };

  const handleUploadError = (error: Error) => {
    console.error('Appwrite upload error:', error);
    alert(`Upload failed: ${error.message}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      
      {/* Current Media Preview */}
      {currentMedia && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Current {mediaType}:</p>
            <div className="flex gap-2">
              {currentMedia.startsWith('data:') ? (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                  Legacy Base64 ({(currentMedia.length / 1024).toFixed(0)} KB)
                </span>
              ) : currentMedia.includes('appwrite.io') ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Appwrite Cloud Storage
                </span>
              ) : (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Cloud Storage
                </span>
              )}
            </div>
          </div>
          
          {/* Migration Notice for Base64 Files */}
          {currentMedia.startsWith('data:') && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Migration Recommended</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This file is stored as base64 data. Upload a new file to use Appwrite Cloud Storage for better performance and reliability.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="border border-gray-200 rounded-lg overflow-hidden max-w-sm relative">
            {mediaType === 'video' || currentMedia.includes('video') ? (
              <video 
                src={currentMedia} 
                className="w-full h-32 object-cover"
                muted
                controls={false}
                onError={(e) => {
                  console.error('Video preview error for:', currentMedia.substring(0, 100));
                }}
              />
            ) : (
              <img 
                src={currentMedia} 
                alt={`Current ${section} ${mediaType}`}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  console.error('Image preview error for:', currentMedia.substring(0, 100));
                }}
              />
            )}
            {currentMedia.startsWith('data:') && currentMedia.length > 1000000 && (
              <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded">
                Large Base64
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {currentMedia.startsWith('data:') 
              ? `Legacy base64 storage (${(currentMedia.length / 1024 / 1024).toFixed(2)} MB) - Upload new file to migrate`
              : `Appwrite Cloud Storage: ${currentMedia.split('/').pop()}`
            }
          </p>
        </div>
      )}

      {/* Success Banner */}
      {justUploaded && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Upload successful! "{justUploaded}" is now live on your website.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Appwrite Upload Area */}
      <div className="space-y-4">
        {mediaType === 'video' || (section === 'hero' && mediaType === 'both') ? (
          <VideoUploader
            onUploadComplete={handleAppwriteUploadComplete}
            currentVideoUrl={currentMedia?.startsWith('http') ? currentMedia : undefined}
            title={`Upload ${section === 'hero' ? 'Hero' : section.charAt(0).toUpperCase() + section.slice(1)} Video`}
            description="Upload your video using Appwrite Storage - secure, fast cloud storage"
            maxSize="32MB"
            autoSaveToDatabase={true}
            contentKey={getContentKey() || 'hero_background_video'}
            className="bg-white"
          />
        ) : (
          <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Upload {mediaType === 'image' ? 'Image' : 'Media'}</h4>
            <AppwriteFileUploader
              uploadType={mediaType}
              onUploadComplete={(res) => {
                if (res?.url) {
                  handleAppwriteUploadComplete(res.url);
                }
              }}
              onUploadError={handleUploadError}
              maxFiles={1}
              maxSizeMB={mediaType === 'image' ? 8 : 32}
            />
          </div>
        )}
      </div>
    </div>
  );
}