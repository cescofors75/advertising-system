'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';
import AdList from '@/components/admin/AdList';
import AdForm from '@/components/admin/AdForm';

export default function AdminPage() {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAd, setPreviewAd] = useState(null);

  // Fetch all advertisements
  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      console.log('Fetching advertisements and schedules...');
      
      const { data, error } = await supabase
        .from('advertisements')
        .select('*, schedules(*)') // Join with schedules table
        .order('id');

      if (error) throw error;
      
      console.log('Fetched data:', data);
      
      // Make sure schedules are properly formatted in the ads
      const formattedData = data?.map(ad => ({
        ...ad,
        schedules: Array.isArray(ad.schedules) ? ad.schedules : []
      })) || [];
      
      console.log('Formatted ad data with schedules:', formattedData);
      setAdvertisements(formattedData);
    } catch (err) {
      console.error('Error fetching advertisements:', err);
      setError('Failed to load advertisements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const handleEdit = (ad) => {
    setCurrentAd(ad);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        // Delete related schedules first
        await supabase
          .from('schedules')
          .delete()
          .eq('advertisement_id', id);
          
        // Then delete the advertisement
        const { error } = await supabase
          .from('advertisements')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        // If the ad has media, delete it from storage
        if (currentAd && currentAd.media_url) {
          // Extract the file path from the URL
          const urlParts = currentAd.media_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          
          const { error: storageError } = await supabase
            .storage
            .from('advertisements')
            .remove([fileName]);
            
          if (storageError) console.error('Error deleting file:', storageError);
        }
        
        // Refresh the list
        fetchAdvertisements();
      } catch (err) {
        console.error('Error deleting advertisement:', err);
        alert('Failed to delete advertisement');
      }
    }
  };

  const handleFormCancel = () => {
    setIsEditing(false);
    setCurrentAd(null);
  };

  const handleFormSubmit = () => {
    setIsEditing(false);
    setCurrentAd(null);
    fetchAdvertisements();
  };

  const handlePreview = (ad) => {
    setPreviewAd(ad);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewAd(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Advertisement Management System</h1>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {isEditing ? (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {currentAd?.id ? 'Edit Advertisement' : 'Add New Advertisement'}
            </h2>
            <AdForm 
              ad={currentAd} 
              onCancel={handleFormCancel} 
              onSubmit={handleFormSubmit} 
            />
          </div>
        ) : (
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Add New Advertisement
            </button>
          </div>
        )}
        
        {/* Advertisement list */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Loading advertisements...</p>
          </div>
        ) : (
          <AdList 
            advertisements={advertisements} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            onPreview={handlePreview}
          />
        )}
        
        {/* Preview Modal */}
        {showPreview && previewAd && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-xl font-bold">Preview: {previewAd.title}</h3>
                <button 
                  onClick={closePreview}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4">{previewAd.title}</h2>
                
                <div className="my-4 w-full flex justify-center">
                  {previewAd.media_url ? (
                    previewAd.media_type === 'video' ? (
                      <video 
                        className="max-w-full max-h-[50vh] object-contain" 
                        src={previewAd.media_url} 
                        controls 
                      />
                    ) : (
                      <img 
                        className="max-w-full max-h-[50vh] object-contain" 
                        src={previewAd.media_url} 
                        alt={previewAd.title} 
                      />
                    )
                  ) : (
                    <div className="w-full max-w-lg h-48 bg-gray-200 flex items-center justify-center rounded">
                      <p className="text-gray-500">No media available</p>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 max-w-2xl text-center mt-4">
                  {previewAd.description}
                </p>
              </div>
              <div className="border-t p-4 flex justify-end">
                <button 
                  onClick={closePreview}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

