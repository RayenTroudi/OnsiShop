'use client';

import { useEffect, useRef, useState } from 'react';
import VideoUpload from './VideoUpload';

interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  alt?: string;
  type: string;
  section?: string;
  createdAt: string;
  updatedAt: string;
}

export default function HeroVideoManager() {
  const [currentVideo, setCurrentVideo] = useState<MediaAsset | null>(null);
  const [allVideos, setAllVideos] = useState<MediaAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchVideoData();
  }, []);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      
      // Fetch all media assets and filter for videos
      const mediaResponse = await fetch('/api/admin/media');
      if (mediaResponse.ok) {
        const allMedia = await mediaResponse.json();
        const videos = allMedia.filter((asset: MediaAsset) => 
          asset.type.startsWith('video/') && asset.section === 'hero'
        );
        setAllVideos(videos);
        
        // Set the most recent hero video as current
        if (videos.length > 0) {
          setCurrentVideo(videos[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching video data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateVideoFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('video/')) {
      return 'Please select a video file';
    }

    // Check supported formats
    const supportedFormats = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!supportedFormats.includes(file.type)) {
      return 'Supported formats: MP4, WebM, OGG';
    }

    // Check file size (5MB limit for database storage)
    const maxSizeMB = 5;
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `Video must be under ${maxSizeMB}MB. Current size: ${Math.round(fileSizeMB * 100) / 100}MB`;
    }

    return null;
  };

  const handleVideoUpload = async (file: File) => {
    const validationError = validateVideoFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('section', 'hero');
      formData.append('alt', 'Hero background video');

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const newVideo = await response.json();
        setAllVideos(prev => [newVideo, ...prev]);
        setCurrentVideo(newVideo);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        alert('Video uploaded successfully! It may take a moment to appear on the website.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleVideoUpload(file);
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await fetch(`/api/admin/media/${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAllVideos(prev => prev.filter(v => v.id !== videoId));
        if (currentVideo?.id === videoId) {
          const remainingVideos = allVideos.filter(v => v.id !== videoId);
          setCurrentVideo(remainingVideos[0] || null);
        }
        alert('Video deleted successfully!');
      } else {
        throw new Error('Failed to delete video');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete video');
    }
  };

  const selectVideo = (video: MediaAsset) => {
    setCurrentVideo(video);
  };

  const formatFileSize = (bytes: number): string => {
    return `${Math.round(bytes / (1024 * 1024) * 100) / 100}MB`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Hero Background Video</h1>
          <p className="text-indigo-100 mt-1">
            Manage the background video for your homepage hero section
          </p>
        </div>

        {/* Current Video Preview */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Current Video</h2>
          {currentVideo ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <video
                  ref={videoPreviewRef}
                  src={currentVideo.url}
                  controls
                  muted
                  loop
                  className="w-full h-48 rounded-lg object-cover bg-gray-100"
                  poster=""
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">Filename:</span>
                  <p className="text-gray-900">{currentVideo.filename}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="text-gray-900">{currentVideo.type}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Uploaded:</span>
                  <p className="text-gray-900">
                    {new Date(currentVideo.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteVideo(currentVideo.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Current Video
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📹</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Video Uploaded</h3>
              <p className="text-gray-600">Upload a video to display in your hero section</p>
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Upload New Video</h2>
          
          <div className="space-y-4">
            {/* Upload Guidelines */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <h3 className="font-medium text-blue-900 mb-2">Video Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Formats:</strong> MP4, WebM, OGG</li>
                <li>• <strong>Maximum size:</strong> 50MB</li>
                <li>• <strong>Recommended:</strong> 1920x1080 or 1280x720 resolution</li>
                <li>• <strong>Duration:</strong> 10-30 seconds for best performance</li>
                <li>• <strong>Tip:</strong> Use online video compressors to reduce file size</li>
              </ul>
            </div>

            {/* New VideoUpload Component */}
            <VideoUpload
              maxSizeMB={50}
              onUploadSuccess={(url) => {
                // Refresh the video data after successful upload
                fetchVideoData();
              }}
              onUploadError={(error) => {
                alert(`Upload failed: ${error}`);
              }}
            />
          </div>
        </div>

        {/* Video Library */}
        {allVideos.length > 0 && (
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Video Library</h2>
            <div className="grid gap-4">
              {allVideos.map((video) => (
                <div 
                  key={video.id}
                  className={`
                    flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${currentVideo?.id === video.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => selectVideo(video)}
                >
                  <video
                    src={video.url}
                    className="w-20 h-12 rounded object-cover bg-gray-100"
                    muted
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{video.filename}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {currentVideo?.id === video.id && (
                      <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}