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
    qr_type: 'web', // Nuevo campo
    product_name: '', // Nuevo campo
    product_price: '', // Nuevo campo
    payment_provider: 'stripe', // Nuevo campo con Stripe como valor predeterminado
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
        qr_type: formData.qr_type, // Nuevo campo
        product_name: formData.product_name, // Nuevo campo
        product_price: formData.product_price, // Nuevo campo
        payment_provider: formData.payment_provider, // Nuevo campo
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
            Mostrar Código QR
          </span>
        </label>

        {formData.show_qr_code && (
          <div className="mt-4 space-y-4">
            {/* QR Type Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Tipo de QR
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="qr_type"
                    value="web"
                    checked={formData.qr_type === 'web'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`relative w-5 h-5 rounded-full border ${
                    formData.qr_type === 'web' ? 'border-blue-500 bg-blue-500' : 'border-slate-500'
                  } flex items-center justify-center`}>
                    {formData.qr_type === 'web' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="ml-2 text-slate-300 flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    Redirección Web
                  </span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="qr_type"
                    value="payment"
                    checked={formData.qr_type === 'payment'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`relative w-5 h-5 rounded-full border ${
                    formData.qr_type === 'payment' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-500'
                  } flex items-center justify-center`}>
                    {formData.qr_type === 'payment' && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="ml-2 text-slate-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                    Pago Directo
                  </span>
                </label>
              </div>
            </div>

            {/* URL del sitio web (si qr_type es 'web') */}
            {formData.qr_type === 'web' && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="website_url">
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
            )}

            {/* Campos adicionales para pago (si qr_type es 'payment') */}
            {formData.qr_type === 'payment' && (
              <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl">
                <h3 className="text-lg font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                  Configuración de Pago
                </h3>

                {/* Nombre del Producto */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="product_name">
                    Nombre del Producto
                  </label>
                  <input
                    id="product_name"
                    name="product_name"
                    type="text"
                    value={formData.product_name || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Ej: Ticket Evento VIP"
                  />
                </div>

                {/* Precio del Producto */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2" htmlFor="product_price">
                    Precio (€)
                  </label>
                  <input
                    id="product_price"
                    name="product_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.product_price || ""}
                    onChange={handleChange}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="19.99"
                  />
                </div>

                {/* Proveedor de Pago */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Método de Pago
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <label className={`relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer border-2 transition-all ${formData.payment_provider === 'stripe' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'}`}>
                      <input
                        type="radio"
                        name="payment_provider"
                        value="stripe"
                        checked={formData.payment_provider === 'stripe'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <svg className="w-8 h-8 mb-2" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M35 5H5V35H35V5Z" fill="#6772E5"/>
                        <path d="M20 22.5C20 19.46 22.46 17 25.5 17C28.54 17 31 19.46 31 22.5C31 25.54 28.54 28 25.5 28C22.46 28 20 25.54 20 22.5Z" fill="white"/>
                        <path d="M13 17.5H9V28H13V17.5Z" fill="white"/>
                        <path d="M17 12H13V16H17V12Z" fill="white"/>
                      </svg>
                      <span className={`text-sm font-medium ${formData.payment_provider === 'stripe' ? 'text-white' : 'text-slate-300'}`}>Stripe</span>
                    </label>

                    <label className={`relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer border-2 transition-all ${formData.payment_provider === 'googlepay' ? 'border-green-500 bg-green-500/10' : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'}`}>
                      <input
                        type="radio"
                        name="payment_provider"
                        value="googlepay"
                        checked={formData.payment_provider === 'googlepay'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <svg className="w-8 h-8 mb-2" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="8" fill="#000"/>
                        <path d="M20 28C24.4183 28 28 24.4183 28 20C28 15.5817 24.4183 12 20 12C15.5817 12 12 15.5817 12 20C12 24.4183 15.5817 28 20 28Z" fill="#FEFEFE"/>
                        <path d="M20 24C22.2091 24 24 22.2091 24 20C24 17.7909 22.2091 16 20 16C17.7909 16 16 17.7909 16 20C16 22.2091 17.7909 24 20 24Z" fill="#5F6368"/>
                      </svg>
                      <span className={`text-sm font-medium ${formData.payment_provider === 'googlepay' ? 'text-white' : 'text-slate-300'}`}>Google Pay</span>
                    </label>

                    <label className={`relative flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer border-2 transition-all ${formData.payment_provider === 'applepay' ? 'border-gray-300 bg-gray-500/10' : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'}`}>
                      <input
                        type="radio"
                        name="payment_provider"
                        value="applepay"
                        checked={formData.payment_provider === 'applepay'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <svg className="w-8 h-8 mb-2" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="8" fill="#000"/>
                        <path d="M25.14 14.16C24.54 14.89 23.56 15.47 22.58 15.38C22.42 14.4 22.9 13.35 23.46 12.71C24.06 11.98 25.1 11.43 26 11.37C26.14 12.38 25.74 13.43 25.14 14.16ZM26 15.85C24.56 15.77 23.26 16.6 22.52 16.6C21.78 16.6 20.68 15.89 19.54 15.91C18.08 15.93 16.74 16.74 16 18.01C14.48 20.57 15.62 24.33 17.08 26.38C17.8 27.39 18.66 28.5 19.78 28.48C20.86 28.46 21.28 27.8 22.58 27.8C23.88 27.8 24.26 28.48 25.4 28.47C26.58 28.46 27.32 27.46 28.04 26.44C28.86 25.29 29.2 24.17 29.22 24.09C29.2 24.05 27.22 23.31 27.2 21.12C27.18 19.27 28.76 18.38 28.84 18.32C27.8 16.8 26.18 16.67 25.6 16.63C24.56 16.56 23.62 17.09 23.04 17.09C22.42 17.09 21.62 16.63 20.74 16.63C20.74 16.63 20.74 16.63 20.74 16.63H26V15.85Z" fill="white"/>
                      </svg>
                      <span className={`text-sm font-medium ${formData.payment_provider === 'applepay' ? 'text-white' : 'text-slate-300'}`}>Apple Pay</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Vista previa del QR actualizada para mostrar información de pago */}
            {((formData.qr_type === 'web' && formData.website_url) || 
              (formData.qr_type === 'payment' && formData.product_name && formData.product_price)) && (
              <div className="mt-4 p-4 bg-slate-800/50 rounded-xl">
                <p className="text-sm text-slate-400 mb-3">Vista previa del Código QR:</p>
                <div className={`flex ${formData.qr_type === 'payment' ? 'justify-between' : 'justify-center'} items-center`}>
                  <div className={`bg-white p-2 rounded-lg ${formData.qr_type === 'payment' ? 'border-2 border-emerald-500' : ''}`}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        formData.qr_type === 'web' 
                          ? formData.website_url 
                          : `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substring(2, 10)}?product=${encodeURIComponent(formData.product_name)}&price=${isNaN(parseFloat(formData.product_price)) ? "0.00" : parseFloat(formData.product_price)}&currency=EUR`
                      )}`}
                      alt="Código QR"
                      className="block w-32 h-32"
                    />
                  </div>
                  
                  {formData.qr_type === 'payment' && formData.product_name && formData.product_price && (
                    <div className="ml-4 p-4 bg-slate-700/50 rounded-xl max-w-xs">
                      <h4 className="text-lg font-bold text-emerald-400 mb-2">{formData.product_name}</h4>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-white">{isNaN(parseFloat(formData.product_price)) ? "0.00" : parseFloat(formData.product_price).toFixed(2)}€</span>
                        <span className="ml-2 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/30">
                          Pago Rápido
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-2">
                        Pasarela de pago: 
                        <span className="ml-1 font-medium text-slate-300">
                          {formData.payment_provider === 'stripe' ? 'Stripe' : 
                           formData.payment_provider === 'googlepay' ? 'Google Pay' : 'Apple Pay'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
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