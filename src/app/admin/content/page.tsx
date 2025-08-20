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
  'about.title': 'About Our Store',
  'about.description': 'We are passionate about bringing you the finest clothing at affordable prices.',
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

  const contentKeys = Object.keys(content);
  const heroKeys = contentKeys.filter(key => key.startsWith('hero.'));
  const aboutKeys = contentKeys.filter(key => key.startsWith('about.'));
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
            <p className="text-gray-600 mb-4">Content for the main hero section on your homepage</p>
            <div className="space-y-4">
              {heroKeys.map((key) => (
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

        {/* About Section Tab */}
        {activeTab === 'about' && (
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">About Section Content</h2>
            <div className="space-y-4">
              {aboutKeys.map((key) => (
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
