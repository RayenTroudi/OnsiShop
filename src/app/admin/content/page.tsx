'use client';

import { useEffect, useState } from 'react';

interface ContentItem {
  key: string;
  value: string;
  updatedAt?: string;
}

const DEFAULT_CONTENT = {
  'hero.title': 'Welcome to Our Clothing Store',
  'hero.subtitle': 'Discover the latest fashion trends and styles',
  'hero.description': 'Shop our collection of high-quality clothing for men and women. From casual wear to formal attire, we have everything you need to look your best.',
  'hero.buttonText': 'Shop Now',
  'hero.backgroundVideo': '/videos/clothing-shoot.mp4',
  'hero.backgroundImage': '/images/background-image-1756043891412-0nifzaa2fwm.PNG',
  'about.title': 'About Our Store',
  'about.description': 'We are passionate about bringing you the finest clothing at affordable prices.',
  'about.backgroundImage': '/images/about-background.jpg',
  'footer.companyName': 'Clothing Store',
  'footer.description': 'Your fashion destination',
  'contact.email': 'contact@clothingstore.com',
  'contact.phone': '+1 (555) 123-4567',
  'contact.address': '123 Fashion Street, Style City, SC 12345'
};

export default function ContentManagerPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false);
  const [isUploadingPromotionImage, setIsUploadingPromotionImage] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [message, setMessage] = useState('');

  // Fetch content on mount
  useEffect(() => {
    fetchContent();
  }, []);

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/content');
      const result = await response.json();

      if (result.success) {
        setContent(result.data || {});
      } else {
        showMessage('Failed to fetch content', 'error');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      showMessage('Error fetching content', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const saveContent = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      const result = await response.json();

      if (result.success) {
        showMessage('Content saved successfully!');
        await fetchContent(); // Refresh data
      } else {
        showMessage(result.message || 'Failed to save content', 'error');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      showMessage('Error saving content', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const addDefaultContent = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: DEFAULT_CONTENT })
      });

      const result = await response.json();

      if (result.success) {
        showMessage('Default content added successfully!');
        await fetchContent();
      } else {
        showMessage(result.message || 'Failed to add default content', 'error');
      }
    } catch (error) {
      console.error('Error adding default content:', error);
      showMessage('Error adding default content', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateContentValue = (key: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addNewContentItem = () => {
    if (!newKey.trim() || !newValue.trim()) {
      showMessage('Both key and value are required', 'error');
      return;
    }

    if (content[newKey]) {
      showMessage('Key already exists', 'error');
      return;
    }

    setContent(prev => ({
      ...prev,
      [newKey]: newValue
    }));

    setNewKey('');
    setNewValue('');
    showMessage('Content item added');
  };

  const removeContentItem = (key: string) => {
    setContent(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    showMessage('Content item removed');
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      showMessage('File too large. Maximum size is 50MB.', 'error');
      event.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('Invalid file type. Only MP4, WebM, AVI, and MOV files are allowed.', 'error');
      event.target.value = '';
      return;
    }

    try {
      setIsUploadingVideo(true);
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch('/api/admin/upload-video', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Update the hero.backgroundVideo content
        setContent(prev => ({
          ...prev,
          'hero.backgroundVideo': result.videoUrl
        }));
        showMessage('Video uploaded successfully!');
      } else {
        showMessage(result.error || 'Failed to upload video', 'error');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      showMessage('Error uploading video', 'error');
    } finally {
      setIsUploadingVideo(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent any default browser behavior
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showMessage('File too large. Maximum size is 10MB.', 'error');
      event.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed.', 'error');
      event.target.value = '';
      return;
    }

    try {
      setIsUploadingImage(true);
      
      // Create FormData with explicit headers
      const formData = new FormData();
      formData.append('image', file, file.name);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary
      });

      const result = await response.json();

      if (result.success) {
        // Update the about.backgroundImage content
        const updatedContent = {
          ...content,
          'about.backgroundImage': result.imageUrl
        };
        setContent(updatedContent);
        
        // Automatically save to database
        try {
          const saveResponse = await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: updatedContent })
          });

          const saveResult = await saveResponse.json();
          
          if (saveResult.success) {
            showMessage('Background image uploaded and saved successfully!');
          } else {
            showMessage(`Image uploaded but failed to save: ${saveResult.message}`, 'error');
          }
        } catch (saveError) {
          showMessage('Image uploaded but failed to save to database', 'error');
        }
      } else {
        showMessage(result.error || 'Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showMessage('Error uploading image', 'error');
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleHeroImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent any default browser behavior
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showMessage('File too large. Maximum size is 10MB.', 'error');
      event.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed.', 'error');
      event.target.value = '';
      return;
    }

    try {
      setIsUploadingHeroImage(true);
      
      // Create FormData with explicit headers
      const formData = new FormData();
      formData.append('image', file, file.name);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary
      });

      const result = await response.json();

      if (result.success) {
        // Update the hero.backgroundImage content
        const updatedContent = {
          ...content,
          'hero.backgroundImage': result.imageUrl
        };
        setContent(updatedContent);
        
        // Automatically save to database
        try {
          const saveResponse = await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: updatedContent })
          });

          const saveResult = await saveResponse.json();
          
          if (saveResult.success) {
            showMessage('Hero background image uploaded and saved successfully!');
          } else {
            showMessage(`Image uploaded but failed to save: ${saveResult.message}`, 'error');
          }
        } catch (saveError) {
          showMessage('Image uploaded but failed to save to database', 'error');
        }
      } else {
        showMessage(result.error || 'Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Error uploading hero image:', error);
      showMessage('Error uploading hero image', 'error');
    } finally {
      setIsUploadingHeroImage(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handlePromotionImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent any default browser behavior
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showMessage('File too large. Maximum size is 10MB.', 'error');
      event.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('Invalid file type. Only JPEG, PNG, WebP, and GIF files are allowed.', 'error');
      event.target.value = '';
      return;
    }

    try {
      setIsUploadingPromotionImage(true);
      
      // Create FormData with explicit headers
      const formData = new FormData();
      formData.append('image', file, file.name);

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it with boundary
      });

      const result = await response.json();

      if (result.success) {
        // Update the promotion.backgroundImage content
        const updatedContent = {
          ...content,
          'promotion.backgroundImage': result.imageUrl
        };
        setContent(updatedContent);
        
        // Automatically save to database
        try {
          const saveResponse = await fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: updatedContent })
          });

          const saveResult = await saveResponse.json();
          
          if (saveResult.success) {
            showMessage('Promotion background image uploaded and saved successfully!');
          } else {
            showMessage(`Image uploaded but failed to save: ${saveResult.message}`, 'error');
          }
        } catch (saveError) {
          showMessage('Image uploaded but failed to save to database', 'error');
        }
      } else {
        showMessage(result.error || 'Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Error uploading promotion image:', error);
      showMessage('Error uploading promotion image', 'error');
    } finally {
      setIsUploadingPromotionImage(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const contentKeys = Object.keys(content);
  const heroKeys = contentKeys.filter(key => key.startsWith('hero.'));
  const aboutKeys = contentKeys.filter(key => key.startsWith('about.'));
  const promotionKeys = contentKeys.filter(key => key.startsWith('promotion.'));
  const footerKeys = contentKeys.filter(key => key.startsWith('footer.'));
  const contactKeys = contentKeys.filter(key => key.startsWith('contact.'));

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading content...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-gray-600">
            Manage your website content without touching code
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchContent} 
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Refresh
          </button>
          <button 
            onClick={saveContent} 
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {contentKeys.length === 0 && (
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">No Content Found</h2>
          <p className="text-gray-600 mb-4">
            It looks like you don't have any content yet. Add some default content to get started.
          </p>
          <button 
            onClick={addDefaultContent} 
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Add Default Content
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex border-b overflow-x-auto">
          {[
            { key: 'content', label: 'All Content' },
            { key: 'hero', label: 'Hero Section' },
            { key: 'videos', label: 'Video Management' },
            { key: 'images', label: 'Image Management' },
            { key: 'promotion', label: 'Promotions' },
            { key: 'about', label: 'About' },
            { key: 'footer', label: 'Footer' },
            { key: 'contact', label: 'Contact' },
            { key: 'add', label: 'Add New' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-medium whitespace-nowrap ${
                activeTab === tab.key 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* All Content Tab */}
        {activeTab === 'content' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              All Content Items 
              <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                {contentKeys.length} items
              </span>
            </h2>
            <div className="space-y-4">
              {contentKeys.map((key) => (
                <div key={key} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      {key}
                    </label>
                    {content[key] && content[key]!.length > 100 ? (
                      <textarea
                        value={content[key]}
                        onChange={(e) => updateContentValue(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    ) : (
                      <input
                        type="text"
                        value={content[key]}
                        onChange={(e) => updateContentValue(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                  <button
                    onClick={() => removeContentItem(key)}
                    className="mt-6 px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hero Section Tab */}
        {activeTab === 'hero' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Hero Section Content</h2>
            <p className="text-gray-600 mb-6">Content for the main hero section on your homepage</p>
            
            {/* Background Video Upload Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Background Video</h3>
              <div className="space-y-4">
                {content['hero.backgroundVideo'] && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Video</label>
                    <div className="relative w-full max-w-md">
                      <video 
                        src={content['hero.backgroundVideo']} 
                        className="w-full h-32 object-cover rounded-lg border"
                        controls
                        muted
                      />
                      <div className="mt-2 text-sm text-gray-600">
                        {content['hero.backgroundVideo']}
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload New Video
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/avi,video/mov"
                      onChange={handleVideoUpload}
                      disabled={isUploadingVideo}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {isUploadingVideo && (
                      <div className="flex items-center text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Uploading...
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports MP4, WebM, AVI, MOV. Max size: 50MB
                  </p>
                </div>
                
                {content['hero.backgroundVideo'] && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Video URL (editable)</label>
                    <input
                      type="text"
                      value={content['hero.backgroundVideo'] || ''}
                      onChange={(e) => updateContentValue('hero.backgroundVideo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/videos/your-video.mp4"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Background Image Upload Section */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Background Image</h3>
              <div className="space-y-4">
                {content['hero.backgroundImage'] && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Background Image</label>
                    <div className="relative w-full max-w-md">
                      <img 
                        src={content['hero.backgroundImage']} 
                        alt="Hero background"
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = '/images/placeholder.jpg';
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        Preview
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {content['hero.backgroundImage']}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload New Background Image
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleHeroImageUpload}
                      disabled={isUploadingHeroImage}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    {isUploadingHeroImage && (
                      <div className="flex items-center text-sm text-green-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        Uploading...
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports JPEG, PNG, WebP, GIF. Max size: 10MB
                  </p>
                </div>
                
                {content['hero.backgroundImage'] && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL (editable)</label>
                    <input
                      type="text"
                      value={content['hero.backgroundImage'] || ''}
                      onChange={(e) => updateContentValue('hero.backgroundImage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="/images/your-image.jpg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-4">
              {heroKeys.filter(key => key !== 'hero.backgroundVideo' && key !== 'hero.backgroundImage').map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    {key.replace('hero.', '')}
                  </label>
                  {content[key] && content[key]!.length > 100 ? (
                    <textarea
                      value={content[key]}
                      onChange={(e) => updateContentValue(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={content[key]}
                      onChange={(e) => updateContentValue(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dedicated Video Management Tab */}
        {activeTab === 'videos' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Video Management</h2>
            <p className="text-gray-600 mb-6">Manage background videos and other video content for your website</p>
            
            {/* Hero Background Video */}
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <h3 className="text-lg font-semibold mb-4 text-purple-800">🎬 Hero Background Video</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Current Video Preview */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">Current Background Video</label>
                  {content['hero.backgroundVideo'] ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <video 
                          src={content['hero.backgroundVideo']} 
                          className="w-full h-40 object-cover rounded-lg border-2 border-purple-200 shadow-sm"
                          controls
                          muted
                          poster="/images/video-placeholder.jpg"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          Preview
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                        <strong>File:</strong> {content['hero.backgroundVideo']}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">🎥</div>
                        <div>No background video set</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Upload New Background Video
                    </label>
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-4 bg-white">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/avi,video/mov"
                        onChange={handleVideoUpload}
                        disabled={isUploadingVideo}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        <div>• Supported formats: MP4, WebM, AVI, MOV</div>
                        <div>• Maximum file size: 50MB</div>
                        <div>• Recommended resolution: 1920x1080</div>
                      </div>
                    </div>
                    
                    {isUploadingVideo && (
                      <div className="mt-3 flex items-center justify-center text-sm text-purple-600 bg-purple-50 p-3 rounded-lg">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-3"></div>
                        Uploading video... Please wait
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Or set video URL manually
                    </label>
                    <input
                      type="text"
                      value={content['hero.backgroundVideo'] || ''}
                      onChange={(e) => updateContentValue('hero.backgroundVideo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="/videos/your-video.mp4"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      Enter the path to a video file in your public/videos folder
                    </div>
                  </div>

                  {content['hero.backgroundVideo'] && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const videoUrl = content['hero.backgroundVideo'];
                          if (videoUrl) {
                            // Use window.open instead of creating/clicking a link to prevent downloads
                            window.open(videoUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      >
                        🔗 Open Video
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove the background video?')) {
                            updateContentValue('hero.backgroundVideo', '');
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-md font-semibold mb-2 text-blue-800">💡 Video Optimization Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Use MP4 format for best browser compatibility</li>
                <li>• Keep file size under 10MB for faster loading</li>
                <li>• Use 1920x1080 resolution for full HD quality</li>
                <li>• Videos should be 10-30 seconds long for hero backgrounds</li>
                <li>• Consider using a compressed format to reduce bandwidth usage</li>
              </ul>
            </div>
          </div>
        )}

        {/* Dedicated Image Management Tab */}
        {activeTab === 'images' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Image Management</h2>
            <p className="text-gray-600 mb-6">Manage background images and other image content for your website</p>
            
            {/* Hero Background Image */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-blue-800">🏆 Hero Section Background Image</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Current Image Preview */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">Current Hero Background Image</label>
                  {content['hero.backgroundImage'] ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <img 
                          src={content['hero.backgroundImage']} 
                          alt="winter collection"
                          className="w-full h-40 object-cover rounded-lg border-2 border-blue-200 shadow-sm"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yjc4OGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          Preview
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                        <strong>File:</strong> {content['hero.backgroundImage']}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">🖼️</div>
                        <div>No hero background image set</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Upload New Hero Background Image
                    </label>
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-white">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleHeroImageUpload}
                        disabled={isUploadingHeroImage}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                        multiple={false}
                        capture={false}
                        autoComplete="off"
                        onClick={(e) => {
                          // Clear any previous value to ensure change event fires
                          const target = e.target as HTMLInputElement;
                          target.value = '';
                        }}
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        <div>• Supported formats: JPEG, PNG, WebP, GIF</div>
                        <div>• Maximum file size: 10MB</div>
                        <div>• Recommended resolution: 1920x1080 or higher</div>
                      </div>
                    </div>
                    
                    {isUploadingHeroImage && (
                      <div className="mt-3 flex items-center justify-center text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                        Uploading hero image... Please wait
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Or set hero image URL manually
                    </label>
                    <input
                      type="text"
                      value={content['hero.backgroundImage'] || ''}
                      onChange={(e) => updateContentValue('hero.backgroundImage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="/images/your-hero-image.jpg"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      Enter the path to an image file in your public/images folder
                    </div>
                  </div>

                  {content['hero.backgroundImage'] && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const imageUrl = content['hero.backgroundImage'];
                          if (imageUrl) {
                            // Use window.open instead of creating/clicking a link to prevent downloads
                            window.open(imageUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      >
                        View Full Size
                      </button>
                      <button
                        onClick={() => updateContentValue('hero.backgroundImage', '')}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About Background Image */}
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-4 text-green-800">🖼️ About Section Background Image</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Current Image Preview */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">Current Background Image</label>
                  {content['about.backgroundImage'] ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <img 
                          src={content['about.backgroundImage']} 
                          alt="About background"
                          className="w-full h-40 object-cover rounded-lg border-2 border-green-200 shadow-sm"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yjc4OGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          Preview
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                        <strong>File:</strong> {content['about.backgroundImage']}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">🖼️</div>
                        <div>No background image set</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Upload New Background Image
                    </label>
                    <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-white">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        <div>• Supported formats: JPEG, PNG, WebP, GIF</div>
                        <div>• Maximum file size: 10MB</div>
                        <div>• Recommended resolution: 1920x1080 or higher</div>
                      </div>
                    </div>
                    
                    {isUploadingImage && (
                      <div className="mt-3 flex items-center justify-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-3"></div>
                        Uploading image... Please wait
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Or set image URL manually
                    </label>
                    <input
                      type="text"
                      value={content['about.backgroundImage'] || ''}
                      onChange={(e) => updateContentValue('about.backgroundImage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="/images/your-image.jpg"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      Enter the path to an image file in your public/images folder
                    </div>
                  </div>

                  {content['about.backgroundImage'] && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const imageUrl = content['about.backgroundImage'];
                          if (imageUrl) {
                            // Use window.open instead of creating/clicking a link to prevent downloads
                            window.open(imageUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      >
                        🔗 Open Image
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove the background image?')) {
                            updateContentValue('about.backgroundImage', '');
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Image Optimization Tips */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-md font-semibold mb-2 text-green-800">💡 Image Optimization Tips</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Use JPEG for photos with many colors, PNG for graphics with transparency</li>
                <li>• WebP format provides better compression with quality</li>
                <li>• Keep file size under 2MB for faster loading</li>
                <li>• Use 1920x1080 or higher resolution for background images</li>
                <li>• Consider compressing images before upload to reduce bandwidth usage</li>
              </ul>
            </div>
          </div>
        )}

        {/* About Section Tab */}
        {activeTab === 'about' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">About Section Content</h2>
            <p className="text-gray-600 mb-6">Content for the about section including background image</p>
            
            {/* Background Image Upload Section */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Background Image</h3>
              <div className="space-y-4">
                {content['about.backgroundImage'] && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Background Image</label>
                    <div className="relative w-full max-w-md">
                      <img 
                        src={content['about.backgroundImage']} 
                        alt="About background"
                        className="w-full h-32 object-cover rounded-lg border"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yjc4OGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                        }}
                      />
                      <div className="mt-2 text-sm text-gray-600">
                        {content['about.backgroundImage']}
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Upload New Background Image
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    {isUploadingImage && (
                      <div className="flex items-center text-sm text-green-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        Uploading...
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports JPEG, PNG, WebP, GIF. Max size: 10MB
                  </p>
                </div>
                
                {content['about.backgroundImage'] && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Image URL (editable)</label>
                    <input
                      type="text"
                      value={content['about.backgroundImage'] || ''}
                      onChange={(e) => updateContentValue('about.backgroundImage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="/images/your-image.jpg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-4">
              {aboutKeys.filter(key => key !== 'about.backgroundImage').map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    {key.replace('about.', '')}
                  </label>
                  <textarea
                    value={content[key]}
                    onChange={(e) => updateContentValue(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Section Tab */}
        {activeTab === 'footer' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Footer Content</h2>
            <div className="space-y-4">
              {footerKeys.map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    {key.replace('footer.', '')}
                  </label>
                  <input
                    type="text"
                    value={content[key]}
                    onChange={(e) => updateContentValue(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Promotion Section Tab */}
        {activeTab === 'promotion' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Promotion Section</h2>
            <p className="text-gray-600 mb-6">Manage the promotional banner content and background image</p>
            
            {/* Background Image Management */}
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-4 text-green-800">🎯 Promotion Background Image</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Current Image Preview */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">Current Promotion Background</label>
                  {content['promotion.backgroundImage'] ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <img 
                          src={content['promotion.backgroundImage']} 
                          alt="promotion background"
                          className="w-full h-40 object-cover rounded-lg border-2 border-green-200 shadow-sm"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2Yjc4OGQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          Preview
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                        <strong>File:</strong> {content['promotion.backgroundImage']}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-4xl mb-2">🖼️</div>
                        <div>No promotion background image set</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Upload New Promotion Background
                    </label>
                    <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-white">
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                        onChange={handlePromotionImageUpload}
                        disabled={isUploadingPromotionImage}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
                      />
                      <div className="mt-2 text-xs text-gray-500">
                        <div>• Supported formats: JPEG, PNG, WebP, GIF</div>
                        <div>• Maximum file size: 10MB</div>
                        <div>• Recommended resolution: 1920x1080 or higher</div>
                      </div>
                    </div>
                    
                    {isUploadingPromotionImage && (
                      <div className="mt-3 flex items-center justify-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mr-3"></div>
                        Uploading image... Please wait
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Or set promotion image URL manually
                    </label>
                    <input
                      type="text"
                      value={content['promotion.backgroundImage'] || ''}
                      onChange={(e) => updateContentValue('promotion.backgroundImage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="/images/your-promotion-image.jpg"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      Enter the path to an image file in your public/images folder
                    </div>
                  </div>

                  {content['promotion.backgroundImage'] && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const imageUrl = content['promotion.backgroundImage'];
                          if (imageUrl) {
                            // Use window.open instead of creating/clicking a link to prevent downloads
                            window.open(imageUrl, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      >
                        🔗 Open Image
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to remove the promotion background image?')) {
                            updateContentValue('promotion.backgroundImage', '');
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Promotion Text Content</h3>
              {[
                { key: 'promotion.title', label: 'Title', placeholder: 'Stay Warm,\\nStay Stylish' },
                { key: 'promotion.subtitle', label: 'Subtitle', placeholder: 'Stay cozy and fashionable this winter with our winter collection!' },
                { key: 'promotion.buttonText', label: 'Button Text', placeholder: 'View Collection' },
                { key: 'promotion.buttonLink', label: 'Button Link', placeholder: '/search/winter-2024' }
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    {label}
                  </label>
                  {key === 'promotion.title' || key === 'promotion.subtitle' ? (
                    <textarea
                      value={content[key] || ''}
                      onChange={(e) => updateContentValue(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={placeholder}
                      rows={key === 'promotion.title' ? 2 : 3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={content[key] || ''}
                      onChange={(e) => updateContentValue(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={placeholder}
                    />
                  )}
                  {key === 'promotion.title' && (
                    <div className="mt-1 text-xs text-gray-500">
                      Use \\n for line breaks in the title
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-md font-semibold mb-2 text-green-800">💡 Promotion Tips</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Use high-quality images that represent your promotion or product</li>
                <li>• Keep titles short and impactful</li>
                <li>• Make button text action-oriented (e.g., "Shop Now", "View Collection")</li>
                <li>• Test your button links to ensure they work correctly</li>
                <li>• Use consistent branding colors and fonts</li>
              </ul>
            </div>
          </div>
        )}

        {/* Contact Section Tab */}
        {activeTab === 'contact' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              {contactKeys.map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1">
                    {key.replace('contact.', '')}
                  </label>
                  <input
                    type="text"
                    value={content[key]}
                    onChange={(e) => updateContentValue(key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Content Tab */}
        {activeTab === 'add' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Content Item</h2>
            <p className="text-gray-600 mb-4">Create new content items with custom keys</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Content Key</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g., hero.title, about.description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content Value</label>
                <textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Enter the content value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <button 
                onClick={addNewContentItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Content Item
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
