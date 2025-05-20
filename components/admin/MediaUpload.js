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

    // Verificar tipo y tamaño del archivo
    const fileType = file.type.split('/')[0]; // 'image' or 'video'
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const validImageTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
    const validVideoTypes = ['mp4', 'webm', 'ogg'];
    
    // Validar tipo de archivo
    if (fileType === 'image' && !validImageTypes.includes(fileExtension)) {
      setError(`Formato de imagen inválido. Formatos soportados: ${validImageTypes.join(', ')}`);
      return;
    } else if (fileType === 'video' && !validVideoTypes.includes(fileExtension)) {
      setError(`Formato de video inválido. Formatos soportados: ${validVideoTypes.join(', ')}`);
      return;
    }
    
    // Validar tamaño del archivo (máximo 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setError('El tamaño del archivo excede el límite de 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Crear un nombre de archivo único
      const timestamp = new Date().getTime();
      const fileName = `${timestamp}_${file.name.replace(/\s+/g, '_')}`;
      
      // Subir archivo al almacenamiento de Supabase
      const { data, error: uploadError } = await supabase
        .storage
        .from('advertisements')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Obtener URL pública para el archivo subido
      const { data: { publicUrl } } = supabase
        .storage
        .from('advertisements')
        .getPublicUrl(fileName);
      
      // Establecer la URL y el tipo de multimedia
      setMediaUrl(publicUrl);
      setMediaType(fileType);
      
      // Llamar al callback del padre con la URL y el tipo
      if (onUpload) {
        onUpload(publicUrl, fileType);
      }
    } catch (err) {
      console.error('Error al subir archivo:', err);
      setError('Error al subir el archivo. Por favor, inténtelo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setMediaUrl(null);
    setMediaType('image');
    
    // Llamar al callback del padre con valores nulos
    if (onUpload) {
      onUpload(null, 'image');
    }
    
    // Reiniciar el input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-black text-sm font-bold mb-2">
        Multimedia
      </label>
      
      {/* Visualización del archivo multimedia */}
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
                  alt="Vista previa del anuncio" 
                />
              )}
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="mt-2 text-red-600 hover:text-red-800"
              >
                Eliminar multimedia
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex items-center justify-center w-full">
            {/* Área para arrastrar y soltar archivos */}
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-black">
                  <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                </p>
                <p className="text-xs text-black">
                  Imágenes (PNG, JPG, GIF, WebP) o Videos (MP4, WebM, OGG)
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
      
      {/* Indicador de carga */}
      {uploading && (
        <div className="mb-4">
          <p className="text-black">Subiendo...</p>
        </div>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <div className="mb-4">
          <p className="text-black text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

