'use client';

import { useTranslation } from '@/contexts/TranslationContext';
import { useEffect, useState } from 'react';

interface ContentItem {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

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

type ContentSection = 'all' | 'hero' | 'video' | 'image' | 'promotions' | 'about' | 'footer' | 'contact';

export default function ContentAdmin() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<ContentSection>('all');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // New content/media form states
  const [newContentKey, setNewContentKey] = useState('');
  const [newContentValue, setNewContentValue] = useState('');
  const [newMediaFile, setNewMediaFile] = useState<File | null>(null);
  const [newMediaSection, setNewMediaSection] = useState('');
  const [newMediaAlt, setNewMediaAlt] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [contentResponse, mediaResponse] = await Promise.all([
        fetch('/api/admin/content'),
        fetch('/api/admin/media')
      ]);

      if (contentResponse.ok) {
        const content = await contentResponse.json();
        setContentItems(content);
      }

      if (mediaResponse.ok) {
        const media = await mediaResponse.json();
        setMediaAssets(media);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContent();
    setRefreshing(false);
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentItems }),
      });

      if (response.ok) {
        alert('All changes saved successfully!');
        await fetchContent();
      } else {
        throw new Error('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (id: string, field: 'key' | 'value', value: string) => {
    setContentItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) return;

    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setContentItems(items => items.filter(item => item.id !== id));
        alert('Content deleted successfully!');
      } else {
        throw new Error('Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Error deleting content');
    }
  };

  const deleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media asset?')) return;

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

  const addNewContent = async () => {
    if (!newContentKey.trim() || !newContentValue.trim()) {
      alert('Please enter both key and value');
      return;
    }

    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: newContentKey,
          value: newContentValue,
        }),
      });

      if (response.ok) {
        const newItem = await response.json();
        setContentItems(items => [...items, newItem]);
        setNewContentKey('');
        setNewContentValue('');
        alert('Content added successfully!');
      } else {
        throw new Error('Failed to add content');
      }
    } catch (error) {
      console.error('Error adding content:', error);
      alert('Error adding content');
    }
  };

  const uploadMedia = async () => {
    if (!newMediaFile) {
      alert('Please select a file');
      return;
    }

    // Check file size before upload
    const fileSizeMB = newMediaFile.size / (1024 * 1024);
    const isVideo = newMediaFile.type.startsWith('video/');
    const isImage = newMediaFile.type.startsWith('image/');
    
    let maxSizeMB: number;
    if (isVideo) {
      maxSizeMB = 5; // Reduced from 50MB to 5MB for database storage
    } else if (isImage) {
      maxSizeMB = 5; // Reduced to 5MB for better performance
    } else {
      maxSizeMB = 5;
    }

    if (fileSizeMB > maxSizeMB) {
      alert(`File too large. Maximum size is ${maxSizeMB}MB for ${newMediaFile.type.split('/')[0]} files.\nCurrent file size: ${Math.round(fileSizeMB * 100) / 100}MB\n\nPlease compress your file or use a smaller file.`);
      return;
    }

    const formData = new FormData();
    formData.append('file', newMediaFile);
    formData.append('section', newMediaSection);
    formData.append('alt', newMediaAlt);

    try {
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newAsset = await response.json();
        setMediaAssets(assets => [...assets, newAsset]);
        setNewMediaFile(null);
        setNewMediaSection('');
        setNewMediaAlt('');
        alert('Media uploaded successfully!');
      } else {
        // Try to parse error response
        let errorMessage = 'Failed to upload media';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          if (errorData.details) {
            errorMessage += `\n\nDetails: ${errorData.details}`;
          }
        } catch (parseError) {
          // If response is not JSON, handle common HTTP status codes
          if (response.status === 413) {
            errorMessage = `File too large for server. The server has a request size limit.\n\nFile size: ${Math.round(fileSizeMB * 100) / 100}MB\n\nPlease use a smaller file (under 5MB recommended).`;
          } else if (response.status === 400) {
            errorMessage = 'Invalid file or request. Please check the file type and try again.';
          } else if (response.status === 500) {
            errorMessage = 'Server error occurred while processing the file. Please try again or use a smaller file.';
          }
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      let errorMessage = 'Network error occurred while uploading media.';
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Could not connect to server. Please check your internet connection and try again.';
      } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
        errorMessage = `Server returned an invalid response. This usually means the file is too large.\n\nFile size: ${Math.round(fileSizeMB * 100) / 100}MB\n\nPlease try with a smaller file (under 5MB).`;
      }
      
      alert(errorMessage);
    }
  };

  const filteredContent = contentItems.filter(item => {
    if (activeSection === 'all') return true;
    return item.key.toLowerCase().includes(activeSection.toLowerCase());
  });

  const filteredMedia = mediaAssets.filter(asset => {
    if (activeSection === 'all') return true;
    if (activeSection === 'video') return asset.type.includes('video');
    if (activeSection === 'image') return asset.type.includes('image');
    return asset.section?.toLowerCase() === activeSection.toLowerCase();
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={saveAllChanges}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Manage your website content without touching code
      </p>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All Content' },
          { key: 'hero', label: 'Hero Section' },
          { key: 'video', label: 'Video Management' },
          { key: 'image', label: 'Image Management' },
          { key: 'promotions', label: 'Promotions' },
          { key: 'about', label: 'About' },
          { key: 'footer', label: 'Footer' },
          { key: 'contact', label: 'Contact' },
        ].map(section => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key as ContentSection)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === section.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Items Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Text Content ({filteredContent.length})</h2>
          </div>
          <div className="p-6">
            {/* Add New Content */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Add New Content</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Content key (e.g., hero_title)"
                  value={newContentKey}
                  onChange={(e) => setNewContentKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <textarea
                  placeholder="Content value"
                  value={newContentValue}
                  onChange={(e) => setNewContentValue(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={addNewContent}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add New
                </button>
              </div>
            </div>

            {/* Existing Content */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredContent.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={item.key}
                      onChange={(e) => handleContentChange(item.id, 'key', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                    <textarea
                      value={item.value}
                      onChange={(e) => handleContentChange(item.id, 'value', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Updated: {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => deleteContent(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Media Assets Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Media Assets ({filteredMedia.length})</h2>
          </div>
          <div className="p-6">
            {/* Upload New Media */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Upload New Media</h3>
              <div className="space-y-3">
                <div>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setNewMediaFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    <div>• Images: JPEG, PNG, GIF, WebP (max 5MB)</div>
                    <div>• Videos: MP4, WebM, OGG (max 5MB)</div>
                    <div>• For larger files, consider compressing before upload</div>
                  </div>
                  {newMediaFile && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                      <div className="font-medium text-blue-800">Selected File:</div>
                      <div className="text-blue-700">
                        {newMediaFile.name} ({Math.round(newMediaFile.size / (1024 * 1024) * 100) / 100}MB)
                      </div>
                      {newMediaFile.size > 5 * 1024 * 1024 && (
                        <div className="text-red-600 font-medium mt-1">
                          ⚠️ File is too large. Please use a file under 5MB.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Section (hero, about, footer, etc.)"
                  value={newMediaSection}
                  onChange={(e) => setNewMediaSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Alt text (for accessibility)"
                  value={newMediaAlt}
                  onChange={(e) => setNewMediaAlt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={uploadMedia}
                  disabled={!newMediaFile || newMediaFile.size > 5 * 1024 * 1024}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            </div>

            {/* Existing Media */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredMedia.map((asset) => (
                <div key={asset.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {asset.type.includes('image') ? (
                        <img
                          src={asset.url}
                          alt={asset.alt || asset.filename}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ) : asset.type.includes('video') ? (
                        <video
                          src={asset.url}
                          className="w-16 h-16 object-cover rounded-md"
                          muted
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-500 text-xs">FILE</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {asset.filename}
                      </p>
                      <p className="text-sm text-gray-500">
                        Section: {asset.section || 'None'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Type: {asset.type}
                      </p>
                      <p className="text-sm text-gray-500">
                        Added: {new Date(asset.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMedia(asset.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}