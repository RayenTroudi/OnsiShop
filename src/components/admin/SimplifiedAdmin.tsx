'use client';

import { useEffect, useState } from 'react';
import HealthMonitor from './HealthMonitor';
import SimpleMediaUploader from './SimpleMediaUploader';

interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  type: string;
  section: string;
  createdAt: string;
}

type ActiveSection = 'hero-video' | 'hero-image' | 'promotions' | 'about' | 'footer' | 'health';

export default function SimplifiedAdmin() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('hero-video');
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMediaAssets();
  }, []);

  const fetchMediaAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/media');
      if (response.ok) {
        const assets = await response.json();
        setMediaAssets(assets);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (url: string) => {
    // Refresh media assets immediately after successful upload
    console.log('✅ Upload successful, refreshing media list...');
    fetchMediaAssets();
    
    // Also refresh after a short delay to ensure database consistency
    setTimeout(() => {
      fetchMediaAssets();
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
    const asset = mediaAssets.find(asset => 
      asset.section === section && 
      (type === 'image' ? asset.type.startsWith('image/') : asset.type.startsWith('video/'))
    );
    return asset?.url;
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Media Manager</h1>
        <p className="text-lg text-gray-600">
          Simple drag & drop interface to manage your website images and videos
        </p>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-3 mb-8 p-4 bg-gray-50 rounded-lg">
        {[
          { key: 'hero-video', label: '🎬 Hero Video', desc: 'Homepage background video' },
          { key: 'hero-image', label: '🖼️ Hero Image', desc: 'Homepage background image' },
          { key: 'promotions', label: '🎯 Promotions', desc: 'Promotional section image' },
          { key: 'about', label: '📖 About', desc: 'About page content' },
          { key: 'footer', label: '📬 Footer', desc: 'Footer section media' },
          { key: 'health', label: '🏥 System Health', desc: 'Database and system monitoring' },
        ].map(section => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key as ActiveSection)}
            className={`flex-1 min-w-[200px] p-4 rounded-lg text-left transition-all ${
              activeSection === section.key
                ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <div className="font-semibold">{section.label}</div>
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
          <SimpleMediaUploader
            section="hero"
            mediaType="video"
            currentMedia={getCurrentMedia('hero', 'video')}
            onUploadSuccess={handleUploadSuccess}
            title="🎬 Hero Background Video"
            description="Upload a video that will play as the background on your homepage hero section. This creates an engaging first impression for visitors."
          />
        )}

        {/* Hero Image Section */}
        {activeSection === 'hero-image' && (
          <SimpleMediaUploader
            section="hero"
            mediaType="image"
            currentMedia={getCurrentMedia('hero', 'image')}
            onUploadSuccess={handleUploadSuccess}
            title="🖼️ Hero Background Image"
            description="Upload an image for your homepage hero section. This will be displayed as a fallback if no video is uploaded, or on devices where videos don't autoplay."
          />
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

        {/* About Section */}
        {activeSection === 'about' && (
          <SimpleMediaUploader
            section="about"
            mediaType="both"
            currentMedia={getCurrentMedia('about', 'image') || getCurrentMedia('about', 'video')}
            onUploadSuccess={handleUploadSuccess}
            title="📖 About Section Media"
            description="Upload images or videos for your About page or About section. This helps tell your brand story visually."
          />
        )}

        {/* Footer Section */}
        {activeSection === 'footer' && (
          <SimpleMediaUploader
            section="footer"
            mediaType="image"
            currentMedia={getCurrentMedia('footer', 'image')}
            onUploadSuccess={handleUploadSuccess}
            title="📬 Footer Background"
            description="Upload background images or logos for your website footer section."
          />
        )}

        {/* Health Monitoring Section */}
        {activeSection === 'health' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🏥 System Health Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Monitor your database connections, circuit breaker status, and overall system health in real-time.
              </p>
              <HealthMonitor />
            </div>
          </div>
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
                    {asset.type.startsWith('image/') ? (
                      <img
                        src={asset.url}
                        alt={asset.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : asset.type.startsWith('video/') ? (
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
                      {asset.type} • {new Date(asset.createdAt).toLocaleDateString()}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {mediaAssets.filter(a => a.type.startsWith('image/')).length}
            </div>
            <div className="text-indigo-700">Images</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {mediaAssets.filter(a => a.type.startsWith('video/')).length}
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
      </div>
    </div>
  );
}