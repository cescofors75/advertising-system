'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';
import MediaUpload from './MediaUpload';
import { Sun, Sunset, Moon, Globe, QrCode, AlertCircle, Save, X } from 'lucide-react';

// Time slot definitions
const TIME_SLOTS = {
  morning: { 
    name: 'Día', 
    startHour: 0, 
    endHour: 8, 
    color: 'blue',
    icon: Sun,
    gradient: 'from-blue-400 to-blue-600'
  },
  afternoon: { 
    name: 'Tarde', 
    startHour: 8, 
    endHour: 16, 
    color: 'green',
    icon: Sunset,
    gradient: 'from-emerald-400 to-green-600'
  },
  night: { 
    name: 'Noche', 
    startHour: 16, 
    endHour: 24, 
    color: 'purple',
    icon: Moon,
    gradient: 'from-purple-400 to-purple-600'
  }
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}
      
      {/* Título */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="title">
          Título del Anuncio <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="Ej: Promoción Especial de Verano"
        />
      </div>
      
      {/* Descripción */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="description">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          placeholder="Describe tu anuncio..."
          rows="4"
        />
      </div>
      
      {/* URL del sitio web */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="website_url">
          <Globe className="inline w-4 h-4 mr-1 mb-1" />
          URL del Sitio Web
        </label>
        <input
          id="website_url"
          name="website_url"
          type="url"
          value={formData.website_url || ""}
          onChange={handleChange}
          className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder="https://ejemplo.com"
        />
      </div>

      {/* QR Code Toggle */}
      <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="show_qr_code"
            checked={formData.show_qr_code || false}
            onChange={handleChange}
            className="sr-only"
          />
          <div className={`relative w-12 h-6 rounded-full transition-colors ${
            formData.show_qr_code ? 'bg-blue-500' : 'bg-slate-600'
          }`}>
            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
              formData.show_qr_code ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </div>
          <span className="ml-3 text-slate-300 flex items-center">
            <QrCode className="w-4 h-4 mr-2" />
            Mostrar Código QR en la imagen
          </span>
        </label>

        {formData.show_qr_code && formData.website_url && (
          <div className="mt-4 p-4 bg-slate-800/50 rounded-xl">
            <p className="text-sm text-slate-400 mb-3">Vista previa del Código QR:</p>
            <div className="flex justify-center">
              <div className="bg-white p-2 rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(formData.website_url)}`}
                  alt="Código QR"
                  className="block"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Media Upload */}
      <MediaUpload
        initialUrl={formData.media_url}
        initialType={formData.media_type}
        onUpload={handleMediaUpload}
      />
      
      {/* Estado Activo */}
      <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="sr-only"
          />
          <div className={`relative w-12 h-6 rounded-full transition-colors ${
            formData.active ? 'bg-emerald-500' : 'bg-slate-600'
          }`}>
            <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${
              formData.active ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </div>
          <span className="ml-3 text-slate-300">
            Anuncio Activo (visible en pantallas)
          </span>
        </label>
      </div>
      
      {/* Time Slot Selection */}
      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
        <h3 className="text-lg font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Franjas Horarias
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          Selecciona las franjas horarias en las que aparecerá este anuncio
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(TIME_SLOTS).map(slotKey => {
            const slot = TIME_SLOTS[slotKey];
            const isSelected = selectedTimeSlots[slotKey];
            const Icon = slot.icon;
            
            return (
              <div 
                key={slotKey}
                onClick={() => handleTimeSlotChange(slotKey)}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  isSelected 
                    ? `bg-gradient-to-br ${slot.gradient} border-transparent shadow-lg` 
                    : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Icon className={`w-5 h-5 mr-2 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <h4 className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {slot.name}
                    </h4>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                  {slot.startHour}:00 - {slot.endHour}:00
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all flex items-center"
          disabled={isSubmitting}
        >
          <X className="w-5 h-5 mr-2" />
          Cancelar
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white rounded-xl font-semibold transition-all flex items-center transform hover:scale-105 shadow-lg"
          disabled={isSubmitting}
        >
          <Save className="w-5 h-5 mr-2" />
          {isSubmitting ? 'Guardando...' : ad?.id ? 'Actualizar Anuncio' : 'Crear Anuncio'}
        </button>
      </div>
    </form>
  );
}