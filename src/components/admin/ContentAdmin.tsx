'use client';

import FileUploader from '@/components/upload/FileUploader';
import { useTranslation } from '@/contexts/TranslationContext';
import { useEffect, useState } from 'react';
import HeroVideoManager from './HeroVideoManager';

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

type ContentSection = 'hero-video' | 'promotions' | 'contact';

export default function ContentAdmin() {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<ContentSection>('hero-video');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // New content/media form states
  const [newContentKey, setNewContentKey] = useState('');
  const [newContentValue, setNewContentValue] = useState('');
  const [newMediaSection, setNewMediaSection] = useState('');
  const [newMediaAlt, setNewMediaAlt] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [contentResponse, mediaResponse] = await Promise.all([
        fetch('/api/content-manager'),
        fetch('/api/admin/media')
      ]);

      if (contentResponse.ok) {
        const contentResult = await contentResponse.json();
        if (contentResult.success && contentResult.items) {
          setContentItems(contentResult.items);
        } else {
          console.error('Content API error:', contentResult);
          setContentItems([]);
        }
      } else {
        console.error('Content API failed:', contentResponse.status);
        setContentItems([]);
      }

      if (mediaResponse.ok) {
        const media = await mediaResponse.json();
        setMediaAssets(media);
      } else {
        console.error('Media API failed:', mediaResponse.status);
        setMediaAssets([]);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setContentItems([]);
      setMediaAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchContent();
    setRefreshing(false);
  };

  const [modifiedItems, setModifiedItems] = useState<Set<string>>(new Set());
  
  const saveAllChanges = async () => {
    // Only save items that have been modified
    const itemsToSave = contentItems.filter(item => modifiedItems.has(item.id));
    
    if (itemsToSave.length === 0) {
      alert('No changes to save');
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/content-manager', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: itemsToSave }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert(`Successfully saved ${result.updated} changes!`);
        setModifiedItems(new Set()); // Clear modified items
        await fetchContent();
      } else {
        throw new Error(result.error || 'Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert(`Error saving changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    // Track that this item has been modified
    setModifiedItems(prev => new Set(prev).add(id));
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content item?')) return;

    const itemToDelete = contentItems.find(item => item.id === id);
    if (!itemToDelete) {
      alert('Content item not found');
      return;
    }

    try {
      const response = await fetch(`/api/content-manager?key=${encodeURIComponent(itemToDelete.key)}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setContentItems(items => items.filter(item => item.id !== id));
        alert('Content deleted successfully!');
      } else {
        throw new Error(result.error || 'Failed to delete content');
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      alert(`Error deleting content: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      const response = await fetch('/api/content-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: newContentKey,
          value: newContentValue,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setContentItems(items => [...items, result.data]);
        setNewContentKey('');
        setNewContentValue('');
        alert('Content added successfully!');
      } else {
        throw new Error(result.error || 'Failed to add content');
      }
    } catch (error) {
      console.error('Error adding content:', error);
      alert(`Error adding content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUploadThingComplete = async (url: string) => {
    console.log(`✅ Upload completed: ${url}`);
    console.log(`📍 Current section input: "${newMediaSection}"`);
    
    try {
      // Validate the URL is from Appwrite
      const isAppwrite = url.includes('appwrite.io') || url.includes('/storage/buckets/');
      
      if (!isAppwrite) {
        console.error('❌ Invalid URL received - not from Appwrite:', url);
        alert('❌ Upload Error: Invalid URL format received. Please try again.');
        return;
      }

      // Determine content key based on section (use newMediaSection or fallback to activeSection)
      let contentKey = null;
      const section = (newMediaSection || activeSection).toLowerCase();
      console.log(`🔍 Processing section: "${section}" (from input: "${newMediaSection}", active: "${activeSection}")`);
      
      if (section === 'promotions' || section === 'promotion') {
        contentKey = 'promotion_background_image';
        console.log(`📝 Set contentKey for promotions: ${contentKey}`);
      } else if (section === 'hero') {
        contentKey = 'hero_background_image';
        console.log(`📝 Set contentKey for hero: ${contentKey}`);
      } else if (section === 'contact') {
        contentKey = 'contact_background_image';
        console.log(`📝 Set contentKey for contact: ${contentKey}`);
      } else {
        console.warn(`❌ Unknown section: "${section}"`);
        console.warn(`❌ Available sections: promotions, hero, contact`);
        console.warn(`❌ Input was: "${newMediaSection}", active section: "${activeSection}"`);
      }
      
      if (!contentKey) {
        console.error(`💥 No contentKey determined for section "${section}"`);
        alert(`❌ Error: Unknown section "${section}". Please select a valid section.`);
        return;
      }

      // Save to database using unified API
      console.log(`🚀 Sending API request with:`, {
        url,
        section: newMediaSection || activeSection,
        mediaType: 'image',
        contentKey
      });
      
      const response = await fetch('/api/admin/media-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          section: newMediaSection || activeSection,
          mediaType: 'image',
          contentKey
        })
      });

      console.log(`📡 API Response status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Appwrite Storage URL saved successfully:', result);
        
        // Refresh content and media data immediately
        console.log('🔄 Refreshing content data...');
        await fetchContent();
        
        // Also refresh after a short delay to ensure database consistency (matching SimplifiedAdmin pattern)
        setTimeout(async () => {
          console.log('🔄 Second refresh after delay...');
          await fetchContent();
        }, 1000);
        
        // Reset form
        console.log('🧹 Resetting form fields...');
        setNewMediaSection('');
        setNewMediaAlt('');
        setDebugInfo(`✅ Last upload: ${section} - ${contentKey} - ${url.split('/').pop()}`);
        
        alert(`✅ Upload successful! Media saved to ${section} section.`);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to save Appwrite Storage URL:', errorData);
        alert(`⚠️ Upload completed but failed to save to database: ${errorData.message || errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving Appwrite Storage URL:', error);
      alert(`❌ Error saving upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUploadError = (error: Error) => {
    console.error('Appwrite upload error:', error);
    alert(`❌ Upload failed: ${error.message}`);
  };

  const filteredContent = contentItems.filter(item => {
    return item.key.toLowerCase().includes(activeSection.toLowerCase().replace('-', '_'));
  });

  const filteredMedia = mediaAssets.filter(asset => {
    if (activeSection === 'hero-video') return false; // Hero video has its own component
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
          { key: 'hero-video', label: 'Hero Video' },
          { key: 'promotions', label: 'Promotions' },
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

      {/* Hero Video Section */}
      {activeSection === 'hero-video' && (
        <div className="mb-6">
          <HeroVideoManager />
        </div>
      )}

      {/* Main Content Grid - Hide when showing hero video */}
      {activeSection !== 'hero-video' && (
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
              <h3 className="text-lg font-medium mb-3">Upload New Media via UploadThing</h3>
              {debugInfo && (
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  <strong>Debug:</strong> {debugInfo}
                </div>
              )}
              <div className="space-y-3">
                <select
                  value={newMediaSection || activeSection}
                  onChange={(e) => setNewMediaSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a section...</option>
                  <option value="promotions">Promotions</option>
                  <option value="hero">Hero</option>
                  <option value="contact">Contact</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  💡 Auto-filled with current section: {activeSection}
                </div>
                <input
                  type="text"
                  placeholder="Alt text (for accessibility)"
                  value={newMediaAlt}
                  onChange={(e) => setNewMediaAlt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                
                {(newMediaSection || activeSection) && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <FileUploader
                      endpoint="mediaUploader"
                      onUploadComplete={(res) => {
                        if (res?.[0]) {
                          handleUploadThingComplete(res[0].url);
                        }
                      }}
                      onUploadError={handleUploadError}
                      variant="dropzone"
                      maxFiles={1}
                    >
                      <div className="text-center space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Drag and drop your image here, or click to browse
                        </p>
                        <p className="text-xs text-gray-500">
                          Uploaded via UploadThing • Maximum file size: 32MB
                        </p>
                        <p className="text-xs text-blue-600">
                          Will be saved to: {newMediaSection || activeSection} section
                        </p>
                      </div>
                    </FileUploader>
                  </div>
                )}
                
                {!(newMediaSection || activeSection) && (
                  <div className="text-sm text-gray-500 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    ⚠️ Please select a section first using the dropdown above
                  </div>
                )}
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
      )}
    </div>
  );
}