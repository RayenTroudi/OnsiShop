'use client';

import { useEffect, useState } from 'react';

interface VideoAsset {
  id: string;
  filename: string;
  url: string;
  alt: string;
  section: string;
  createdAt: string;
  isActive: boolean;
}

interface VideoSelectorProps {
  onVideoSelected?: (videoUrl: string) => void;
}

export default function VideoSelector({ onVideoSelected }: VideoSelectorProps) {
  const [videos, setVideos] = useState<VideoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroVideo, setCurrentHeroVideo] = useState<string>('');
  const [settingVideo, setSettingVideo] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/videos', {
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
        setCurrentHeroVideo(data.currentHeroVideo || '');
        console.log(`📹 Loaded ${data.videos?.length || 0} videos`);
      } else {
        console.error('Failed to fetch videos:', response.status);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const setHeroVideo = async (videoUrl: string, videoId: string) => {
    try {
      setSettingVideo(videoId);
      
      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoUrl,
          videoId
        })
      });

      if (response.ok) {
        setCurrentHeroVideo(videoUrl);
        // Update the videos list to reflect the new active video
        setVideos(prevVideos => 
          prevVideos.map(video => ({
            ...video,
            isActive: video.url === videoUrl
          }))
        );
        
        if (onVideoSelected) {
          onVideoSelected(videoUrl);
        }
        
        alert('Hero video set successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to set hero video: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error setting hero video:', error);
      alert('Error setting hero video');
    } finally {
      setSettingVideo(null);
    }
  };

  const removeHeroVideo = async () => {
    if (!confirm('Are you sure you want to remove the hero video?')) return;
    
    try {
      setSettingVideo('removing');
      
      const response = await fetch('/api/admin/videos', {
        method: 'DELETE'
      });

      if (response.ok) {
        setCurrentHeroVideo('');
        setVideos(prevVideos => 
          prevVideos.map(video => ({
            ...video,
            isActive: false
          }))
        );
        
        if (onVideoSelected) {
          onVideoSelected('');
        }
        
        alert('Hero video removed successfully!');
      } else {
        alert('Failed to remove hero video');
      }
    } catch (error) {
      console.error('Error removing hero video:', error);
      alert('Error removing hero video');
    } finally {
      setSettingVideo(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Video Library</h3>
            <p className="text-sm text-gray-600">
              Select a video to use as your hero background
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchVideos}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            {currentHeroVideo && (
              <button
                onClick={removeHeroVideo}
                disabled={settingVideo === 'removing'}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {settingVideo === 'removing' ? 'Removing...' : 'Remove Hero Video'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {videos.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Found</h3>
            <p className="text-gray-600 mb-4">
              Upload some videos first to use them as hero backgrounds
            </p>
          </div>
        ) : (
          <>
            {currentHeroVideo && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="text-sm font-medium text-green-800 mb-2">Current Hero Video:</h4>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={currentHeroVideo}
                    className="w-full h-full object-cover"
                    controls
                    muted
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`border rounded-lg overflow-hidden ${
                    video.isActive 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="aspect-video bg-black">
                    <video
                      src={video.url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                  </div>
                  
                  <div className="p-3">
                    <h4 className="font-medium text-gray-900 text-sm truncate mb-1">
                      {video.filename}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {video.section} • {new Date(video.createdAt).toLocaleDateString()}
                    </p>
                    
                    <div className="flex items-center space-x-2">
                      {video.isActive ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded font-medium">
                          ✓ Active Hero
                        </span>
                      ) : (
                        <button
                          onClick={() => setHeroVideo(video.url, video.id)}
                          disabled={settingVideo === video.id}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {settingVideo === video.id ? 'Setting...' : 'Set as Hero'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}