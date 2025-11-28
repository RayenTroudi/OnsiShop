'use client';

import { useEffect, useState } from 'react';
import SimpleMediaUploader from './SimpleMediaUploader';
import VideoSelector from './VideoSelector';

interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  type: string;
  section: string;
  createdAt: string;
}

type ActiveSection = 'hero-video' | 'promotions';

export default function SimplifiedAdmin() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('hero-video');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMediaAssets();
    fetchContent();
  }, []);

  const fetchMediaAssets = async () => {
    try {
      const response = await fetch('/api/admin/media');
      if (response.ok) {
        const assets = await response.json();
        // Filter out any assets with invalid data to prevent runtime errors
        const validAssets = assets.filter((asset: any) => 
          asset && 
          typeof asset === 'object' && 
          asset.filename && 
          asset.url && 
          asset.type &&
          typeof asset.type === 'string'
        );
        setMediaAssets(validAssets);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      setMediaAssets([]); // Set empty array on error to prevent undefined issues
    }
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content');
      if (response.ok) {
        const result = await response.json();
        setContent(result.success ? result.data : {});
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (url: string) => {
    // Refresh both media assets and content after successful upload
    console.log('✅ Upload successful, refreshing media and content...');
    fetchMediaAssets();
    fetchContent();
    
    // Also refresh after a short delay to ensure database consistency
    setTimeout(() => {
      fetchMediaAssets();
      fetchContent();
    }, 1000);
  };

  const deleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const response = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMediaAssets(assets => assets.filter(asset => asset.id !== id));
        alert('Media deleted successfully!');
      } else {
        throw new Error('Failed to delete media');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Error deleting media');
    }
  };

  const getCurrentMedia = (section: string, type: 'image' | 'video') => {
    // Get current media from content API (content keys) not media assets
    if (section === 'hero' && type === 'video') return content['hero_background_video'];
    if (section === 'hero' && type === 'image') return content['hero_background_image'];
    if (section === 'promotions' && type === 'image') return content['promotion_background_image'];
    return undefined;
  };

  const getSectionMedia = (section: string) => {
    return mediaAssets.filter(asset => asset.section === section);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Media Manager</h1>
            <p className="text-lg text-gray-600">
              Simple drag & drop interface to manage your website images and videos
            </p>
          </div>
          <a
            href="/admin"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin
          </a>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-3 mb-8 p-4 bg-gray-50 rounded-lg">
        {[
          { key: 'hero-video', label: '🎬 Hero Video', desc: 'Homepage background video' },
          { key: 'promotions', label: '🎯 Promotions', desc: 'Promotional section image' },
        ].map(section => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key as ActiveSection)}
            className={`flex-1 min-w-[200px] p-4 rounded-lg text-left transition-all ${
              activeSection === section.key
                ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
            suppressHydrationWarning
          >
            <div className="font-semibold" suppressHydrationWarning>{section.label}</div>
            <div className={`text-sm ${activeSection === section.key ? 'text-indigo-100' : 'text-gray-500'}`}>
              {section.desc}
            </div>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        
        {/* Hero Video Section */}
        {activeSection === 'hero-video' && (
          <div className="space-y-6">
            <SimpleMediaUploader
              section="hero"
              mediaType="video"
              currentMedia={getCurrentMedia('hero', 'video')}
              onUploadSuccess={handleUploadSuccess}
              title="🎬 Upload New Hero Video"
              description="Upload a new video to add to your video library."
            />
            
            <VideoSelector onVideoSelected={(videoUrl) => {
              console.log('Video selected:', videoUrl);
              // Optionally refresh media assets
              fetchMediaAssets();
            }} />
          </div>
        )}

        {/* Promotions Section */}
        {activeSection === 'promotions' && (
          <SimpleMediaUploader
            section="promotions"
            mediaType="image"
            currentMedia={getCurrentMedia('promotions', 'image')}
            onUploadSuccess={handleUploadSuccess}
            title="🎯 Promotion Background Image"
            description="Upload an image for your promotional section on the homepage. This appears in the promotions banner area to highlight special offers."
          />
        )}

        {/* Current Media List */}
        {activeSection !== 'health' && getSectionMedia(activeSection.replace('-video', '').replace('-image', '')).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📁 Current Media ({getSectionMedia(activeSection.replace('-video', '').replace('-image', '')).length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getSectionMedia(activeSection.replace('-video', '').replace('-image', '')).map((asset) => (
                <div key={asset.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    {asset.type && asset.type.startsWith('image/') ? (
                      <img
                        src={asset.url}
                        alt={asset.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : asset.type && asset.type.startsWith('video/') ? (
                      <video
                        src={asset.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <div className="text-gray-500">
                        <span className="text-2xl">📄</span>
                        <p className="text-sm">File</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-gray-900 truncate">{asset.filename}</p>
                    <p className="text-sm text-gray-500">
                      {asset.type || 'Unknown type'} • {new Date(asset.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => deleteMedia(asset.id)}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
        <h4 className="font-semibold text-indigo-900 mb-2">📊 Quick Stats</h4>
        {loading ? (
          <div className="text-center py-4">
            <div className="text-indigo-600">Loading stats...</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {mediaAssets.filter(a => a.type && a.type.startsWith('image/')).length}
              </div>
              <div className="text-indigo-700">Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mediaAssets.filter(a => a.type && a.type.startsWith('video/')).length}
              </div>
              <div className="text-purple-700">Videos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mediaAssets.filter(a => a.section === 'hero').length}
              </div>
              <div className="text-green-700">Hero Media</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mediaAssets.filter(a => a.section === 'promotions').length}
              </div>
              <div className="text-orange-700">Promotions</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}