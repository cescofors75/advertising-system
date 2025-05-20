'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';
import MediaUpload from './MediaUpload';
import ScheduleForm from './ScheduleForm';

export default function AdForm({ ad, onCancel, onSubmit }) {
  const emptyAd = {
    title: '',
    description: '',
    media_url: null,
    media_type: 'image',
    active: true,
    website_url: '', // New field
    show_qr_code: false, // New field
  };

  const [formData, setFormData] = useState(ad || emptyAd);
  const [schedules, setSchedules] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ad?.schedules) {
      setSchedules(ad.schedules);
    }
  }, [ad]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleMediaUpload = (url, type) => {
    setFormData({
      ...formData,
      media_url: url,
      media_type: type,
    });
  };

  const handleScheduleChange = (newSchedules) => {
    setSchedules(newSchedules);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      let adId = ad?.id;
      
      // Validate form inputs
      if (!formData.title.trim()) {
        throw new Error('El título del anuncio es obligatorio');
      }
      
      // Insert or update the advertisement
      if (adId) {
        // Update existing ad
        const { error } = await supabase
          .from('advertisements')
          .update({
            title: formData.title,
            description: formData.description,
            media_url: formData.media_url,
            media_type: formData.media_type,
            active: formData.active,
            website_url: formData.website_url, // Update website_url
            show_qr_code: formData.show_qr_code, // Update show_qr_code
          })
          .eq('id', adId);
          
        if (error) throw error;
      } else {
        // Insert new ad
        const { data, error } = await supabase
          .from('advertisements')
          .insert({
            title: formData.title,
            description: formData.description,
            media_url: formData.media_url,
            media_type: formData.media_type,
            active: formData.active,
            website_url: formData.website_url, // Insert website_url
            show_qr_code: formData.show_qr_code, // Insert show_qr_code
          })
          .select();
          
        if (error) throw error;
        adId = data[0].id;
      }
      
      // Handle schedules
      console.log('Processing schedules:', schedules);
      if (schedules.length > 0) {
        // Delete existing schedules
        if (adId) {
          console.log('Deleting existing schedules for advertisement ID:', adId);
          const { error: deleteError } = await supabase
            .from('schedules')
            .delete()
            .eq('advertisement_id', adId);
            
          if (deleteError) {
            console.error('Error deleting existing schedules:', deleteError);
            throw deleteError;
          }
        }
        
        // Insert new schedules
        const schedulesToInsert = schedules.map(schedule => {
          // Ensure dates are properly formatted for PostgreSQL
          const startTime = new Date(schedule.start_time).toISOString();
          const endTime = new Date(schedule.end_time).toISOString();
          
          console.log('Schedule to insert:', {
            adId,
            startTime,
            endTime
          });
          
          return {
            advertisement_id: adId,
            start_time: startTime,
            end_time: endTime,
          };
        });
        
        console.log('Inserting schedules:', schedulesToInsert);
        const { data: insertedSchedules, error: scheduleError } = await supabase
          .from('schedules')
          .insert(schedulesToInsert)
          .select(); // Add select to return the inserted data
          
        if (scheduleError) {
          console.error('Error inserting schedules:', scheduleError);
          throw scheduleError;
        }
        
        console.log('Successfully inserted schedules:', insertedSchedules);
        
        // Add verification logging
        console.log('Final state after schedule insert:');
        const { data: verifyAd, error: verifyError } = await supabase
          .from('advertisements')
          .select('*, schedules(*)')
          .eq('id', adId)
          .single();

        if (verifyError) {
          console.error('Error verifying ad data:', verifyError);
        } else {
          console.log('Verified ad with schedules:', verifyAd);
        }
      } else {
        console.log('No schedules to insert');
      }
      
      // Call the onSubmit callback
      if (onSubmit) {
        onSubmit();
      }
    } catch (err) {
      console.error('Error saving advertisement:', err);
      setError(err.message || 'Error al guardar el anuncio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-black-700 text-sm font-bold mb-2" htmlFor="title">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Advertisement Title"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-black-700 text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Advertisement Description"
          rows="4"
        />
      </div>
      {/* Website URL Field */}
      <div className="mb-4">
        <label className="block text-black-700 text-sm font-bold mb-2" htmlFor="website_url">
          Website URL
        </label>
        <input
          id="website_url"
          name="website_url"
          type="url"
          value={formData.website_url || ""}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="https://example.com"
        />
      </div>

      {/* QR Code Checkbox */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="show_qr_code"
            checked={formData.show_qr_code || false}
            onChange={handleChange}
            className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
          />
          <span className="ml-2 text-black-700">Show QR Code (overlaid on image)</span>
        </label>

        {formData.show_qr_code && formData.website_url && (
          <div className="mt-4 p-4 border rounded-md bg-black-50">
            <p className="text-sm text-black-600 mb-2">QR Code Preview:</p>
            <div className="flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(formData.website_url)}`}
                alt="QR Code"
                className="border"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Media Upload Component */}
      <MediaUpload
        initialUrl={formData.media_url}
        initialType={formData.media_type}
        onUpload={handleMediaUpload}
      />
      
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
          />
          <span className="ml-2 text-black-700">Active (visible on display)</span>
        </label>
      </div>
      
      {/* Schedule Form Component */}
      <ScheduleForm
        initialSchedules={schedules}
        onChange={handleScheduleChange}
      />
      
      <div className="flex justify-end space-x-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="bg-black-300 hover:bg-black-400 text-black-800 px-4 py-2 rounded-md"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : ad?.id ? 'Update Advertisement' : 'Create Advertisement'}
        </button>
      </div>
    </form>
  );
}

