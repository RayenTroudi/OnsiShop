"use client";

import VideoUploader from '@/components/upload/VideoUploader';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function HeroVideoManagement() {
  const { user, loading: authLoading } = useAuth();
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = user?.isAdmin;

  // Load current video URL
  useEffect(() => {
    if (!authLoading) {
      fetchCurrentVideo();
    }
  }, [authLoading]);

  const fetchCurrentVideo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/content');
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setCurrentVideoUrl(result.data['hero_background_video'] || '');
      } else {
        throw new Error(result.message || 'Failed to load content');
      }
    } catch (error: any) {
      console.error('Failed to fetch current video:', error);
      setError(error.message || 'Failed to load current video');
    } finally {
      setIsLoading(false);
    }
  };

  const updateVideoUrl = async (newUrl: string) => {
    if (!isAdmin) {
      setError('Admin access required');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('🎬 Starting video URL update process...');
      
      const response = await fetch('/api/content-manager', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          action: 'create',
          key: 'hero_background_video',
          value: newUrl,
          type: 'media'
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        // Handle different types of errors
        if (response.status === 503 && result.retryable) {
          setError(`⚠️ ${result.message || 'Database timeout occurred.'} Your video was uploaded successfully to UploadThing. Please try refreshing the page - the video may already be updated.`);
          
          // Still update the local state since the video was uploaded
          setCurrentVideoUrl(newUrl);
          
        } else {
          throw new Error(result.message || result.error || 'Failed to update video URL');
        }
        return;
      }
      
      if (result.success) {
        setCurrentVideoUrl(newUrl);
        setSuccess(`✅ ${result.message || 'Homepage video updated successfully! Changes are live.'}`);
        
        // Clear browser cache to ensure new video loads
        if ('caches' in window) {
          try {
            await caches.delete('onsi-assets-v1');
            console.log('🧹 Cache cleared for new video');
          } catch (cacheError) {
            console.warn('⚠️ Failed to clear cache:', cacheError);
          }
        }

        // Trigger a soft reload of the page to show new video
        setTimeout(() => {
          window.dispatchEvent(new Event('heroVideoUpdated'));
        }, 1000);
      } else {
        throw new Error(result.message || 'Failed to update video');
      }
    } catch (error: any) {
      console.error('❌ Failed to update video:', error);
      
      // Check if it's a network/timeout error
      const isNetworkError = error.message?.includes('timeout') || 
                            error.message?.includes('fetch') ||
                            error.message?.includes('network');
      
      if (isNetworkError) {
        setError(`🔄 ${error.message || 'Network timeout occurred.'} Your video was uploaded to UploadThing successfully. The database update may have failed temporarily. Please refresh the page to check if the video was updated.`);
        
        // Still update the local URL since upload succeeded
        setCurrentVideoUrl(newUrl);
      } else {
        setError(`❌ ${error.message || 'Failed to update video'}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <p className="text-center text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.94L13.732 4.658c-.77-1.273-2.694-1.273-3.464 0L3.34 16.06c-.77 1.273.192 2.94 1.732 2.94z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to access the video management system.</p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <svg className="mx-auto h-12 w-12 text-orange-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600 mb-4">You need administrator privileges to manage the homepage video.</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Homepage Hero Video Management</h1>
                <p className="text-gray-600 mt-2">Upload and manage the video that appears on your homepage</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="font-medium text-gray-900">{user.email}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-green-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Video Uploader */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <VideoUploader
              currentVideoUrl={currentVideoUrl}
              onUploadComplete={(url) => {
                console.log("✅ Video uploaded and saved automatically:", url);
                // Update local state and refresh page data since auto-save handled the database
                setCurrentVideoUrl(url);
                setSuccess("✅ Video uploaded and saved successfully! Your homepage video is now live.");
                
                // Clear browser cache to ensure new video loads
                if ('caches' in window) {
                  caches.delete('onsi-assets-v1').catch(console.warn);
                }
                
                // Trigger page event for new video
                setTimeout(() => {
                  window.dispatchEvent(new Event('heroVideoUpdated'));
                }, 1000);
              }}
              title="Homepage Hero Video"
              description="This video will be displayed as the background on your homepage hero section"
              maxSize="32MB"
              autoSaveToDatabase={true}
              contentKey="hero_background_video"
            />
            
            {isSaving && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="ml-3 text-blue-800 font-medium">💾 Updating homepage video...</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Preview Homepage
              </a>
              
              <a
                href="/admin"
                className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Admin Dashboard
              </a>
              
              <button
                onClick={fetchCurrentVideo}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}