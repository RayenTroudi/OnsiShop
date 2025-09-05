'use client';

import { useState } from 'react';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

export default function ImageUpload({ images, onImagesChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Ensure images is always an array and filter out malformed URLs
  const safeImages = Array.isArray(images) ? images.filter(img => {
    // Allow data URLs (base64) and regular URLs
    const isValid = !img || (typeof img === 'string' && 
      (img.startsWith('data:') || img.startsWith('http') || img.startsWith('/')) &&
      !img.includes('[') && !img.includes(']') && 
      img !== 'undefined' && img !== 'null');
    if (!isValid) {
      console.warn('🚫 Filtering out malformed image in ImageUpload:', img);
    }
    console.log('🖼️ Processing image URL:', img?.substring(0, 50) + '...', 'Valid:', isValid);
    return isValid;
  }) : [];

  console.log('🔍 ImageUpload received images:', images);
  console.log('🛡️ Safe images after filtering:', safeImages);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    const newImages = [...safeImages];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          // Validate the returned URL (should be a data URL for base64 images)
          if (result.url && typeof result.url === 'string' && 
              (result.url.startsWith('data:') || result.url.startsWith('http') || result.url.startsWith('/')) &&
              !result.url.includes('[') && !result.url.includes(']') && 
              result.url.trim() !== '') {
            newImages.push(result.url);
            console.log('Image uploaded successfully as base64:', result.url.substring(0, 50) + '...');
          } else {
            console.error('Invalid URL returned from upload:', result.url?.substring(0, 100));
            alert(`Upload failed for ${file.name}: Invalid URL returned`);
          }
        } else {
          const error = await response.json();
          console.error('Upload failed for file:', file.name, error);
          const errorMessage = error.details ? `${error.error}: ${error.details}` : (error.error || 'Unknown error');
          alert(`Upload failed for ${file.name}: ${errorMessage}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Upload error for ${file.name}. Please try again.`);
      }
    }

    onImagesChange(newImages);
    setUploading(false);
    
    // Reset the input
    event.target.value = '';
  };

  const handleImageChange = (index: number, value: string) => {
    // Sanitize the value to prevent malformed URLs
    const sanitizedValue = value.trim();
    
    // Skip processing if the value contains invalid characters or is not a valid URL format
    if (sanitizedValue.includes('[') || sanitizedValue.includes(']') ||
        (!sanitizedValue.startsWith('data:') && !sanitizedValue.startsWith('http') && 
         !sanitizedValue.startsWith('/') && sanitizedValue !== '')) {
      console.warn('Invalid URL format detected:', sanitizedValue.substring(0, 50));
      return;
    }
    
    const newImages = [...safeImages];
    newImages[index] = sanitizedValue;
    onImagesChange(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = safeImages.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const addImageField = () => {
    onImagesChange([...safeImages, '']);
  };

  return (
    <div className="space-y-4">
      {/* File Upload - Main Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Product Images
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              <p className="text-xs text-gray-400 mt-1">Images will be stored in database as base64</p>
            </div>
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
        {uploading && (
          <div className="flex items-center justify-center mt-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-sm text-blue-600 ml-2">Uploading images...</p>
          </div>
        )}
      </div>

      {/* Show uploaded images */}
      {safeImages.length > 0 && safeImages.some(img => img.trim() !== '') ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Uploaded Images ({safeImages.filter(img => img.trim() !== '').length})
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {safeImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square w-full">
                  <img
                    src={typeof image === 'string' && image.trim() ? image : '/images/placeholder.jpg'}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover rounded-md border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">No images uploaded yet. Use the upload area above to add product images.</p>
        </div>
      )}

      {/* Optional URL Input Section */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          {showUrlInput ? 'Hide' : 'Show'} manual URL input (optional)
        </button>
        
        {showUrlInput && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter image URLs manually (http/https URLs or data URLs)
            </label>
            {safeImages.map((image, index) => (
              <div key={index} className="flex items-center space-x-4 mb-3">
                <div className="flex-1">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="https://example.com/image.jpg or data:image/jpeg;base64,..."
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
                {image && (
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      src={typeof image === 'string' && image.trim() ? image : '/images/placeholder.jpg'}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                {safeImages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-red-600 hover:text-red-800 flex-shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Image URL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
