'use client';

import { useState, useRef } from 'react';
import { Upload, Image, Video, Trash2, AlertCircle, Check } from 'lucide-react';

export default function MediaUpload({ initialUrl, initialType, onUpload }) {
  const [mediaUrl, setMediaUrl] = useState(initialUrl || null);
  const [mediaType, setMediaType] = useState(initialType || 'image');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
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
    setUploadProgress(0);

    try {
      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Subir archivo via API route a Azure Blob Storage
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir el archivo');
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Establecer la URL y el tipo de multimedia
      setMediaUrl(result.url);
      setMediaType(result.mediaType);
      
      // Llamar al callback del padre con la URL y el tipo
      if (onUpload) {
        onUpload(result.url, result.mediaType);
      }
      
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } catch (err) {
      console.error('Error al subir archivo:', err);
      setError('Error al subir el archivo. Por favor, inténtelo de nuevo.');
      setUploadProgress(0);
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

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-500/10');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[0]);
      fileInputRef.current.files = dataTransfer.files;
      handleFileChange({ target: { files: dataTransfer.files } });
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-slate-300">
        <Upload className="inline w-4 h-4 mr-1 mb-1" />
        Contenido Multimedia
      </label>
      
      {/* Visualización del archivo multimedia */}
      {mediaUrl ? (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex flex-col items-center">
            {mediaType === 'video' ? (
              <div className="relative group">
                <video 
                  className="max-w-full max-h-[300px] object-contain rounded-xl shadow-2xl" 
                  src={mediaUrl} 
                  controls 
                />
                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full flex items-center">
                  <Video className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="text-sm text-slate-300">Video</span>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <img 
                  className="max-w-full max-h-[300px] object-contain rounded-xl shadow-2xl" 
                  src={mediaUrl} 
                  alt="Vista previa del anuncio" 
                />
                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full flex items-center">
                  <img className="w-4 h-4 text-emerald-400 mr-1" />
                  <span className="text-sm text-slate-300">Imagen</span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={handleRemoveMedia}
              className="mt-4 flex items-center px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-all"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar multimedia
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div 
            className="relative bg-slate-800/50 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer hover:bg-slate-800/70 hover:border-slate-600 transition-all"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
              <div className="flex flex-col items-center justify-center">
                <div className="p-4 bg-slate-700/50 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-slate-400" />
                </div>
                <p className="mb-2 text-sm text-slate-300">
                  <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                </p>
                <p className="text-xs text-slate-400">
                  Imágenes (PNG, JPG, GIF, WebP) o Videos (MP4, WebM, OGG)
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Tamaño máximo: 10MB
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
          
          {/* Progress bar */}
          {uploading && uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">Subiendo archivo...</span>
                <span className="text-sm text-slate-400">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Success message */}
      {uploadProgress === 100 && !uploading && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 backdrop-blur">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-emerald-400 mr-3" />
            <p className="text-emerald-400">Archivo subido exitosamente</p>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}