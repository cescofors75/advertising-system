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
    // Nuevas propiedades para personalización del banner
    qr_position: 'top', // 'top' o 'bottom'
    qr_color_web: 'black', // color para banner web (black, blue, purple)
    qr_color_payment: 'orange', // color para banner payment (orange, red, green)
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
        product_name: formData.product_name || null, // Nuevo campo
        product_price: formData.product_price !== '' ? parseFloat(formData.product_price) || null : null, // Nuevo campo
        payment_provider: formData.payment_provider || null, // Nuevo campo
        // Nuevas propiedades para personalización del banner
        qr_position: formData.qr_position || 'top',
        qr_color_web: formData.qr_color_web || 'black',
        qr_color_payment: formData.qr_color_payment || 'orange',
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
            
            {/* Posición del Banner QR */}
            <div className="p-4 bg-slate-800/50 rounded-xl">
              <h3 className="text-lg font-semibold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Personalización del Banner QR
              </h3>
              
              {/* Selector de posición */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Posición del Banner
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="qr_position"
                      value="top"
                      checked={formData.qr_position === 'top' || !formData.qr_position}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`relative w-5 h-5 rounded-full border ${
                      formData.qr_position === 'top' || !formData.qr_position ? 'border-blue-500 bg-blue-500' : 'border-slate-500'
                    } flex items-center justify-center`}>
                      {(formData.qr_position === 'top' || !formData.qr_position) && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="ml-2 text-slate-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="17 11 12 6 7 11" />
                        <line x1="12" y1="18" x2="12" y2="6" />
                      </svg>
                      Banner Superior
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="qr_position"
                      value="bottom"
                      checked={formData.qr_position === 'bottom'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`relative w-5 h-5 rounded-full border ${
                      formData.qr_position === 'bottom' ? 'border-blue-500 bg-blue-500' : 'border-slate-500'
                    } flex items-center justify-center`}>
                      {formData.qr_position === 'bottom' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="ml-2 text-slate-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="7 13 12 18 17 13" />
                        <line x1="12" y1="6" x2="12" y2="18" />
                      </svg>
                      Banner Inferior
                    </span>
                  </label>
                </div>
              </div>
              
              {/* Selector de color para QR web */}
              {formData.qr_type === 'web' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Color del Banner de Información
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <label className={`flex flex-col items-center border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.qr_color_web === 'black' || !formData.qr_color_web ? 'border-blue-500 bg-black/30' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <input
                        type="radio"
                        name="qr_color_web"
                        value="black"
                        checked={formData.qr_color_web === 'black' || !formData.qr_color_web}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-full h-8 bg-black/50 rounded mb-2"></div>
                      <span className="text-sm text-slate-300">Negro</span>
                    </label>
                    
                    <label className={`flex flex-col items-center border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.qr_color_web === 'blue' ? 'border-blue-500 bg-blue-900/30' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <input
                        type="radio"
                        name="qr_color_web"
                        value="blue"
                        checked={formData.qr_color_web === 'blue'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-full h-8 bg-blue-900/50 rounded mb-2"></div>
                      <span className="text-sm text-slate-300">Azul</span>
                    </label>
                    
                    <label className={`flex flex-col items-center border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.qr_color_web === 'purple' ? 'border-blue-500 bg-purple-900/30' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <input
                        type="radio"
                        name="qr_color_web"
                        value="purple"
                        checked={formData.qr_color_web === 'purple'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-full h-8 bg-purple-900/50 rounded mb-2"></div>
                      <span className="text-sm text-slate-300">Morado</span>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Selector de color para QR payment */}
              {formData.qr_type === 'payment' && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Color del Banner de Venta Flash
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {/* Fila 1: Orange, Red, Green (existentes) */}
                    <label className={`flex flex-col items-center border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.qr_color_payment === 'orange' || !formData.qr_color_payment ? 'border-blue-500 bg-orange-900/30' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <input
                        type="radio"
                        name="qr_color_payment"
                        value="orange"
                        checked={formData.qr_color_payment === 'orange' || !formData.qr_color_payment}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-full h-8 bg-orange-900/50 rounded mb-2"></div>
                      <span className="text-sm text-slate-300">Naranja</span>
                    </label>
                    
                    <label className={`flex flex-col items-center border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.qr_color_payment === 'red' ? 'border-blue-500 bg-red-900/30' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <input
                        type="radio"
                        name="qr_color_payment"
                        value="red"
                        checked={formData.qr_color_payment === 'red'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-full h-8 bg-red-900/50 rounded mb-2"></div>
                      <span className="text-sm text-slate-300">Rojo</span>
                    </label>
                    
                    <label className={`flex flex-col items-center border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.qr_color_payment === 'green' ? 'border-blue-500 bg-green-900/30' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <input
                        type="radio"
                        name="qr_color_payment"
                        value="green"
                        checked={formData.qr_color_payment === 'green'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-full h-8 bg-green-900/50 rounded mb-2"></div>
                      <span className="text-sm text-slate-300">Verde</span>
                    </label>

                    {/* Fila 2: Nuevos colores - Blue, Indigo, Pink */}
                    <label className={`flex flex-col items-center border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.qr_color_payment === 'blue' ? 'border-blue-500 bg-blue-900/30' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <input
                        type="radio"
                        name="qr_color_payment"
                        value="blue"
                        checked={formData.qr_color_payment === 'blue'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-full h-8 bg-blue-900/50 rounded mb-2"></div>
                      <span className="text-sm text-slate-300">Azul</span>
                    </label>
                    
                    <label className={`flex flex-col items-center border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.qr_color_payment === 'indigo' ? 'border-blue-500 bg-indigo-900/30' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <input
                        type="radio"
                        name="qr_color_payment"
                        value="indigo"
                        checked={formData.qr_color_payment === 'indigo'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-full h-8 bg-indigo-900/50 rounded mb-2"></div>
                      <span className="text-sm text-slate-300">Índigo</span>
                    </label>
                    
                    <label className={`flex flex-col items-center border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.qr_color_payment === 'pink' ? 'border-blue-500 bg-pink-900/30' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <input
                        type="radio"
                        name="qr_color_payment"
                        value="pink"
                        checked={formData.qr_color_payment === 'pink'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-full h-8 bg-pink-900/50 rounded mb-2"></div>
                      <span className="text-sm text-slate-300">Rosa</span>
                    </label>

                    {/* Fila 3: Más colores - Teal, White, Purple */}
                    <label className={`flex flex-col items-center border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.qr_color_payment === 'teal' ? 'border-blue-500 bg-teal-900/30' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <input
                        type="radio"
                        name="qr_color_payment"
                        value="teal"
                        checked={formData.qr_color_payment === 'teal'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-full h-8 bg-teal-900/50 rounded mb-2"></div>
                      <span className="text-sm text-slate-300">Turquesa</span>
                    </label>
                    
                    <label className={`flex flex-col items-center border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.qr_color_payment === 'white' ? 'border-blue-500 bg-white/10' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <input
                        type="radio"
                        name="qr_color_payment"
                        value="white"
                        checked={formData.qr_color_payment === 'white'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-full h-8 bg-white/30 rounded mb-2"></div>
                      <span className="text-sm text-slate-300">Blanco</span>
                    </label>
                    
                    <label className={`flex flex-col items-center border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      formData.qr_color_payment === 'purple' ? 'border-blue-500 bg-purple-900/30' : 'border-slate-600 hover:border-slate-500'
                    }`}>
                      <input
                        type="radio"
                        name="qr_color_payment"
                        value="purple"
                        checked={formData.qr_color_payment === 'purple'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className="w-full h-8 bg-purple-900/50 rounded mb-2"></div>
                      <span className="text-sm text-slate-300">Púrpura</span>
                    </label>
                  </div>
                </div>
              )}
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
              <div className="mt-4">
                <p className="text-sm text-slate-400 mb-3">Vista previa (aspecto en pantalla):</p>
                
                {/* Simulación de cómo se verá en la pantalla */}
                <div className="relative overflow-hidden rounded-xl bg-slate-900 aspect-video flex items-center justify-center">
                  {/* Imagen o video de fondo (real si existe) */}
                  {formData.media_url ? (
                    formData.media_type === 'video' ? (
                      <video 
                        className="absolute inset-0 w-full h-full object-contain"
                        src={formData.media_url}
                        muted
                        autoPlay
                        loop
                      />
                    ) : (
                      <img 
                        className="absolute inset-0 w-full h-full object-contain"
                        src={formData.media_url}
                        alt={formData.title}
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
                  )}
                  
                  {/* Overlay para mejorar la visibilidad del banner */}
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Banner QR con posición y color personalizables */}
                  <div className={`absolute ${formData.qr_position === 'bottom' ? 'bottom-16' : 'top-0'} left-0 right-0 w-full z-30`}>
                    <div className={`backdrop-blur-md p-3 flex items-center justify-between shadow-xl w-full ${
                      formData.qr_type === 'payment' 
                        ? formData.qr_color_payment === 'red'
                          ? 'bg-red-900/50'
                          : formData.qr_color_payment === 'green'
                            ? 'bg-green-900/50'
                            : formData.qr_color_payment === 'blue'
                              ? 'bg-blue-900/50'
                              : formData.qr_color_payment === 'indigo'
                                ? 'bg-indigo-900/50'
                                : formData.qr_color_payment === 'pink'
                                  ? 'bg-pink-900/50'
                                  : formData.qr_color_payment === 'teal'
                                    ? 'bg-teal-900/50'
                                    : formData.qr_color_payment === 'white'
                                      ? 'bg-white/50'
                                      : formData.qr_color_payment === 'purple'
                                        ? 'bg-purple-900/50'
                                        : 'bg-orange-900/50'
                        : formData.qr_color_web === 'blue'
                          ? 'bg-blue-900/50'
                          : formData.qr_color_web === 'purple'
                            ? 'bg-purple-900/50'
                            : 'bg-black/50'
                    }`}>
                      <div className="flex-grow flex items-center">
                        <div className={`bg-white p-2 rounded-xl shadow-lg mr-4 ${
                          formData.qr_type === 'payment'
                            ? formData.qr_color_payment === 'red'
                              ? 'border-2 border-red-400'
                              : formData.qr_color_payment === 'green'
                                ? 'border-2 border-green-400'
                                : formData.qr_color_payment === 'blue'
                                  ? 'border-2 border-blue-400'
                                  : formData.qr_color_payment === 'indigo'
                                    ? 'border-2 border-indigo-400'
                                    : formData.qr_color_payment === 'pink'
                                      ? 'border-2 border-pink-400'
                                      : formData.qr_color_payment === 'teal'
                                        ? 'border-2 border-teal-400'
                                        : formData.qr_color_payment === 'white'
                                          ? 'border-2 border-white'
                                          : formData.qr_color_payment === 'purple'
                                            ? 'border-2 border-purple-400'
                                            : 'border-2 border-orange-400'
                            : ''
                        }`}>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                              formData.qr_type === 'web' 
                                ? formData.website_url 
                                : `https://checkout.stripe.com/pay/cs_test_${Math.random().toString(36).substring(2, 10)}?product=${encodeURIComponent(formData.product_name)}&price=${isNaN(parseFloat(formData.product_price)) ? "0.00" : parseFloat(formData.product_price)}&currency=EUR`
                            )}`}
                            alt="QR Code"
                            className="w-16 h-16 rounded-lg"
                          />
                        </div>
                        <div className="text-white">
                          <h3 className="text-xl font-bold animate-pulse">
                            {formData.qr_type === 'payment' 
                              ? `¡VENTA FLASH: ${formData.product_name}!` 
                              : '¡Escanea para más información!'}
                          </h3>
                          <p className="text-sm font-medium">
                            {formData.qr_type === 'payment' 
                              ? `${isNaN(parseFloat(formData.product_price)) ? "0.00" : parseFloat(formData.product_price).toFixed(2)}€ - Pago rápido con ${
                                  formData.payment_provider === 'stripe' ? 'Tarjeta' : 
                                  formData.payment_provider === 'googlepay' ? 'Google Pay' : 'Apple Pay'
                                }` 
                              : 'Escanea el código QR o visita nuestra web'}
                          </p>
                        </div>
                      </div>
                      <div className={`ml-4 px-4 py-2 rounded-full border text-white font-bold text-sm animate-pulse ${
                        formData.qr_type === 'payment'
                          ? formData.qr_color_payment === 'red'
                            ? 'bg-red-500/30 border-red-400/50'
                            : formData.qr_color_payment === 'green'
                              ? 'bg-green-500/30 border-green-400/50'
                              : formData.qr_color_payment === 'blue'
                                ? 'bg-blue-500/30 border-blue-400/50'
                                : formData.qr_color_payment === 'indigo'
                                  ? 'bg-indigo-500/30 border-indigo-400/50'
                                  : formData.qr_color_payment === 'pink'
                                    ? 'bg-pink-500/30 border-pink-400/50'
                                    : formData.qr_color_payment === 'teal'
                                      ? 'bg-teal-500/30 border-teal-400/50'
                                      : formData.qr_color_payment === 'white'
                                        ? 'bg-white/30 border-white/50'
                                        : formData.qr_color_payment === 'purple'
                                          ? 'bg-purple-500/30 border-purple-400/50'
                                          : 'bg-orange-500/30 border-orange-400/50'
                          : 'bg-white/30 border-white/50'
                      }`}>
                        {formData.qr_type === 'payment' 
                          ? 'OFERTA ESPECIAL' 
                          : 'Más Información'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contenido simulado (solo si no hay media) */}
                  {!formData.media_url && (
                    <div className="absolute inset-0 flex items-center justify-center text-white opacity-30 text-2xl font-bold">
                      {formData.media_type === 'video' ? (
                        <div className="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Contenido del Video</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Contenido de la Imagen</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Indicador de título */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <div className="inline-block px-4 py-2 bg-black/60 rounded-lg text-white text-sm">
                      {formData.title || "Título del anuncio"}
                    </div>
                  </div>
                </div>
                
                {/* Añadir información adicional */}
                <div className="mt-3 text-xs text-slate-400 text-center">
                  Esta vista previa simula cómo se verá el anuncio en la pantalla de visualización
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