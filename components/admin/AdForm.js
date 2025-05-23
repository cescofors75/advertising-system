'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';
import MediaUpload from './MediaUpload';

// Time slot definitions (same as in other components)
const TIME_SLOTS = {
  morning: { name: 'Day', startHour: 0, endHour: 8, color: 'blue' },
  afternoon: { name: 'Afternoon', startHour: 8, endHour: 16, color: 'green' },
  night: { name: 'Night', startHour: 16, endHour: 24, color: 'purple' }
};

export default function AdForm({ ad, onCancel, onSubmit }) {
  const emptyAd = {
    title: '',
    description: '',
    media_url: null,
    media_type: 'image',
    active: true,
    website_url: '',
    show_qr_code: false,
    // Add time slot fields directly to the ad object
    time_slot_morning: false,
    time_slot_afternoon: false,
    time_slot_night: false
  };

  const [formData, setFormData] = useState(ad || emptyAd);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({
    morning: false,
    afternoon: false,
    night: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Initialize time slots from ad data
  useEffect(() => {
    if (ad) {
      setSelectedTimeSlots({
        morning: ad.time_slot_morning || false,
        afternoon: ad.time_slot_afternoon || false,
        night: ad.time_slot_night || false
      });
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

  // Handle time slot selection change
  const handleTimeSlotChange = (slotKey) => {
    // Toggle the selected state of the clicked time slot
    setSelectedTimeSlots(prev => ({
      ...prev,
      [slotKey]: !prev[slotKey]
    }));
    console.log(`Time slot ${slotKey} toggled to ${!selectedTimeSlots[slotKey]}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    console.log("Form submission started");
    console.log("Selected time slots:", selectedTimeSlots);
    
    try {
      let adId = ad?.id;
      
      // Validar entradas del formulario
      if (!formData.title.trim()) {
        throw new Error('El título del anuncio es obligatorio');
      }
      
      // Prepare ad data with time slot information directly in the ad record
      const adData = {
        title: formData.title,
        description: formData.description,
        media_url: formData.media_url,
        media_type: formData.media_type,
        active: formData.active,
        website_url: formData.website_url,
        show_qr_code: formData.show_qr_code,
        // Add time slot fields
        time_slot_morning: selectedTimeSlots.morning,
        time_slot_afternoon: selectedTimeSlots.afternoon,
        time_slot_night: selectedTimeSlots.night
      };
      
      console.log("Saving ad with time slots:", adData);
      
      if (adId) {
        // Update existing ad
        const { error } = await supabase
          .from('advertisements')
          .update(adData)
          .eq('id', adId);
          
        if (error) throw error;
        console.log("Ad updated successfully");
      } else {
        // Insert new ad
        const { data, error } = await supabase
          .from('advertisements')
          .insert(adData)
          .select();
          
        if (error) throw error;
        adId = data[0].id;
        console.log("New ad created with ID:", adId);
      }
      
      // Call onSubmit callback
      if (onSubmit) {
        onSubmit();
      }
    } catch (err) {
      console.error('Error saving ad:', err);
      setError(err.message || 'Error saving the advertisement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-100 border border-red-400 text-black px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-black text-sm font-bold mb-2" htmlFor="title">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Título del anuncio"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-black text-sm font-bold mb-2" htmlFor="description">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Descripción del anuncio"
          rows="4"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-black text-sm font-bold mb-2" htmlFor="website_url">
          URL del sitio web
        </label>
        <input
          id="website_url"
          name="website_url"
          type="url"
          value={formData.website_url || ""}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-black leading-tight focus:outline-none focus:shadow-outline"
          placeholder="https://ejemplo.com"
        />
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="show_qr_code"
            checked={formData.show_qr_code || false}
            onChange={handleChange}
            className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
          />
          <span className="ml-2 text-black">Mostrar Código QR (superpuesto en la imagen)</span>
        </label>

        {formData.show_qr_code && formData.website_url && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <p className="text-sm text-black mb-2">Vista previa del Código QR:</p>
            <div className="flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(formData.website_url)}`}
                alt="Código QR"
                className="border"
              />
            </div>
          </div>
        )}
      </div>
      
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
          <span className="ml-2 text-black">Activo (visible en pantalla)</span>
        </label>
      </div>
      
      {/* Time Slot Selection */}
      <div className="mb-6 bg-gray-50 p-5 rounded-md border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Selección de Franjas Horarias</h3>
        <p className="text-sm text-gray-600 mb-3">
          Seleccione las franjas horarias en las que desea que aparezca este anuncio. Puede seleccionar múltiples franjas.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(TIME_SLOTS).map(slotKey => {
            const slot = TIME_SLOTS[slotKey];
            const isSelected = selectedTimeSlots[slotKey];
            
            // Define colors directly instead of using string interpolation
            let bgColor = isSelected ? 
              (slot.color === 'blue' ? 'bg-blue-50' : 
               slot.color === 'green' ? 'bg-green-50' : 'bg-purple-50') : 
              'bg-white';
              
            let borderColor = isSelected ? 
              (slot.color === 'blue' ? 'border-blue-500' : 
               slot.color === 'green' ? 'border-green-500' : 'border-purple-500') : 
              'border-gray-200 hover:border-gray-300';
              
            let dotColor = isSelected ? 
              (slot.color === 'blue' ? 'bg-blue-500' : 
               slot.color === 'green' ? 'bg-green-500' : 'bg-purple-500') : 
              'bg-gray-200';
            
            return (
              <div 
                key={slotKey}
                onClick={() => handleTimeSlotChange(slotKey)}
                className={`cursor-pointer p-4 rounded-md border-2 transition-colors ${bgColor} ${borderColor}`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-2 ${dotColor}`} />
                  <h4 className="font-medium">{slot.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mt-1">{slot.startHour}:00 - {slot.endHour}:00</p>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-md"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : ad?.id ? 'Actualizar Anuncio' : 'Crear Anuncio'}
        </button>
      </div>
    </form>
  );
}
