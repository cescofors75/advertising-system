'use client';

import { useState, useRef } from 'react';
import supabase from '@/lib/supabaseClient';

export default function MediaUpload({ initialUrl, initialType, onUpload }) {
  const [mediaUrl, setMediaUrl] = useState(initialUrl || null);
  const [mediaType, setMediaType] = useState(initialType || 'image');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type and size
    const fileType = file.type.split('/')[0]; // 'image' or 'video'
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const validImageTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
    const validVideoTypes = ['mp4', 'webm', 'ogg'];
    
    // Validate file type
    if (fileType === 'image' && !validImageTypes.includes(fileExtension)) {
      setError(`Invalid image format. Supported formats: ${validImageTypes.join(', ')}`);
      return;
    } else if (fileType === 'video' && !validVideoTypes.includes(fileExtension)) {
      setError(`Invalid video format. Supported formats: ${validVideoTypes.join(', ')}`);
      return;
    }
    
    // Validate file size (10MB max)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create a unique file name
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
      
      // Upload file to Supabase Storage
      const { data, error: uploadError } = await supabase
        .storage
        .from('advertisements')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from('advertisements')
        .getPublicUrl(fileName);
      
      // Set the media URL and type
      setMediaUrl(publicUrl);
      setMediaType(fileType);
      
      // Call the parent's callback with the URL and type
      if (onUpload) {
        onUpload(publicUrl, fileType);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setMediaUrl(null);
    setMediaType('image');
    
    // Call the parent's callback with null values
    if (onUpload) {
      onUpload(null, 'image');
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Media
      </label>
      
      {mediaUrl ? (
        <div className="mb-4">
          <div className="bg-gray-100 p-4 rounded-lg mb-2">
            <div className="flex flex-col items-center">
              {mediaType === 'video' ? (
                <video 
                  className="max-w-full max-h-[300px] object-contain mb-2" 
                  src={mediaUrl} 
                  controls 
                />
              ) : (
                <img 
                  className="max-w-full max-h-[300px] object-contain mb-2" 
                  src={mediaUrl} 
                  alt="Advertisement preview" 
                />
              )}
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="mt-2 text-red-600 hover:text-red-800"
              >
                Remove Media
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Images (PNG, JPG, GIF, WebP) or Videos (MP4, WebM, OGG)
                </p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,video/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      )}
      
      {uploading && (
        <div className="mb-4">
          <p className="text-blue-500">Uploading...</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

