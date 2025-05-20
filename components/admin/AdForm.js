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
    website_url: '', // Nuevo campo
    show_qr_code: false, // Nuevo campo
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
      
      // Validar entradas del formulario
      if (!formData.title.trim()) {
        throw new Error('El título del anuncio es obligatorio');
      }
      
      // Insertar o actualizar el anuncio
      if (adId) {
        // Actualizar anuncio existente
        const { error } = await supabase
          .from('advertisements')
          .update({
            title: formData.title,
            description: formData.description,
            media_url: formData.media_url,
            media_type: formData.media_type,
            active: formData.active,
            website_url: formData.website_url, // Actualizar URL del sitio web
            show_qr_code: formData.show_qr_code, // Actualizar mostrar código QR
          })
          .eq('id', adId);
          
        if (error) throw error;
      } else {
        // Insertar nuevo anuncio
        const { data, error } = await supabase
          .from('advertisements')
          .insert({
            title: formData.title,
            description: formData.description,
            media_url: formData.media_url,
            media_type: formData.media_type,
            active: formData.active,
            website_url: formData.website_url, // Insertar URL del sitio web
            show_qr_code: formData.show_qr_code, // Insertar mostrar código QR
          })
          .select();
          
        if (error) throw error;
        adId = data[0].id;
      }
      
      // Manejar programaciones
      console.log('Procesando programaciones:', schedules);
      if (schedules.length > 0) {
        // Eliminar programaciones existentes
        if (adId) {
          console.log('Eliminando programaciones existentes para el ID de anuncio:', adId);
          const { error: deleteError } = await supabase
            .from('schedules')
            .delete()
            .eq('advertisement_id', adId);
            
          if (deleteError) {
            console.error('Error al eliminar programaciones existentes:', deleteError);
            throw deleteError;
          }
        }
        
        // Insertar nuevas programaciones
        const schedulesToInsert = schedules.map(schedule => {
          // Asegurar que las fechas estén correctamente formateadas para PostgreSQL
          const startTime = new Date(schedule.start_time).toISOString();
          const endTime = new Date(schedule.end_time).toISOString();
          
          console.log('Programación a insertar:', {
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
        
        console.log('Insertando programaciones:', schedulesToInsert);
        const { data: insertedSchedules, error: scheduleError } = await supabase
          .from('schedules')
          .insert(schedulesToInsert)
          .select(); // Añadir select para devolver los datos insertados
          
        if (scheduleError) {
          console.error('Error al insertar programaciones:', scheduleError);
          throw scheduleError;
        }
        
        console.log('Programaciones insertadas exitosamente:', insertedSchedules);
        
        // Añadir registro de verificación
        console.log('Estado final después de insertar programación:');
        const { data: verifyAd, error: verifyError } = await supabase
          .from('advertisements')
          .select('*, schedules(*)')
          .eq('id', adId)
          .single();

        if (verifyError) {
          console.error('Error al verificar datos del anuncio:', verifyError);
        } else {
          console.log('Anuncio verificado con programaciones:', verifyAd);
        }
      } else {
        console.log('No hay programaciones para insertar');
      }
      
      // Llamar al callback onSubmit
      if (onSubmit) {
        onSubmit();
      }
    } catch (err) {
      console.error('Error al guardar anuncio:', err);
      setError(err.message || 'Error al guardar el anuncio');
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
      {/* Campo URL del sitio web */}
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

      {/* Casilla de verificación para Código QR */}
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
      
      {/* Componente de carga de multimedia */}
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
      
      {/* Componente de formulario de programación */}
      <ScheduleForm
        initialSchedules={schedules}
        onChange={handleScheduleChange}
      />
      
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

