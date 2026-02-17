'use client';

import { useState, useEffect, useMemo } from 'react';
import AdList from '@/components/admin/AdList';
import AdForm from '@/components/admin/AdForm';
import TimeSlotTabs from '@/components/admin/TimeSlotTabs';
import { Plus, Sparkles, AlertCircle, RefreshCw, CheckCircle, PauseCircle, Clock } from 'lucide-react';

export default function AdminPage() {
  const [advertisements, setAdvertisements] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAd, setCurrentAd] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAd, setPreviewAd] = useState(null);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Obtener todos los anuncios
  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      console.log('Obteniendo anuncios...');
      
      const res = await fetch('/api/ads');
      if (!res.ok) throw new Error('Error al obtener anuncios');
      const data = await res.json();
      
      console.log('Datos obtenidos:', data);
      
      setAdvertisements(data || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error al obtener anuncios:', err);
      setError('Error al cargar los anuncios');
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
    if (window.confirm('¿Está seguro que desea eliminar este anuncio?')) {
      try {
        const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Error al eliminar');
        }
        
        // Actualizar la lista
        fetchAdvertisements();
      } catch (err) {
        console.error('Error al eliminar anuncio:', err);
        alert('Error al eliminar el anuncio');
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
    console.log("Form submitted successfully, refreshing advertisements list...");
    // Use setTimeout to ensure the UI updates before fetching
    setTimeout(() => {
      fetchAdvertisements();
    }, 500);
  };

  const handlePreview = (ad) => {
    setPreviewAd(ad);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewAd(null);
  };
  
  // Handle filtered ads from time slot tabs
  const handleSelectedAdsChange = (filteredAdsList) => {
    setFilteredAds(filteredAdsList);
  };

  const summaryStats = useMemo(() => {
    const total = advertisements.length;
    const active = advertisements.filter(ad => ad.active).length;
    const inactive = total - active;
    const withSlots = advertisements.filter(
      ad => ad.time_slot_morning || ad.time_slot_afternoon || ad.time_slot_night
    ).length;
    return { total, active, inactive, withSlots };
  }, [advertisements]);

  const displayAds = useMemo(() => {
    const base = filteredAds || [];
    return showOnlyActive ? base.filter(ad => ad.active) : base;
  }, [filteredAds, showOnlyActive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center">
              <Sparkles className="w-10 h-10 mr-3 text-blue-400" />
              Sistema de Gestión de Anuncios
            </h1>
            <div className="flex items-center gap-3">
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center transition-all transform hover:scale-105 shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nuevo Anuncio
                </button>
              )}
              <button
                onClick={fetchAdvertisements}
                className="bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 px-4 py-3 rounded-xl font-semibold flex items-center transition-all border border-slate-700/50"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Actualizar
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-slate-300 text-lg">Gestiona y programa tus anuncios publicitarios en tiempo real</p>
            <div className="text-sm text-slate-400">
              {lastUpdate ? `Última actualización: ${lastUpdate.toLocaleTimeString()}` : 'Actualizando...'}
            </div>
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Total anuncios</span>
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold mt-3">{summaryStats.total}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Activos</span>
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold mt-3">{summaryStats.active}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Inactivos</span>
              <PauseCircle className="w-5 h-5 text-slate-400" />
            </div>
            <div className="text-3xl font-bold mt-3">{summaryStats.inactive}</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Con franjas</span>
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold mt-3">{summaryStats.withSlots}</div>
          </div>
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6 backdrop-blur">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}
        
        {isEditing ? (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700/50 shadow-2xl mb-8">
            <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              {currentAd?.id ? 'Editar Anuncio' : 'Crear Nuevo Anuncio'}
            </h2>
            <AdForm 
              ad={currentAd} 
              onCancel={handleFormCancel} 
              onSubmit={handleFormSubmit} 
            />
          </div>
        ) : null}
        
        {/* Time Slot Tabs */}
        {!loading && !isEditing && (
          <div className="mb-8 space-y-4">
            <TimeSlotTabs 
              advertisements={advertisements}
              onSelectedAdsChange={handleSelectedAdsChange}
            />
            <div className="flex items-center justify-between bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-3">
              <div className="text-sm text-slate-300">
                Mostrando <span className="font-semibold text-white">{displayAds.length}</span> anuncio{displayAds.length !== 1 ? 's' : ''}
              </div>
              <label className="flex items-center gap-3 text-sm text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyActive}
                  onChange={(e) => setShowOnlyActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
                />
                Mostrar solo activos
              </label>
            </div>
          </div>
        )}
        
        {/* Lista de anuncios */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-300 text-lg">Cargando anuncios...</p>
          </div>
        ) : (
          !isEditing && (
            displayAds.length > 0 ? (
              <AdList 
                advertisements={displayAds} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                onPreview={handlePreview}
              />
            ) : (
              <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-12 text-center border border-slate-700/50">
                <div className="text-slate-400 mb-4">
                  <Clock className="w-16 h-16 mx-auto opacity-50" />
                </div>
                <p className="text-slate-300 text-lg">No hay anuncios para esta selección.</p>
                <p className="text-slate-400 text-sm mt-2">Prueba cambiar de franja o desactivar el filtro de activos.</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Crear anuncio
                </button>
              </div>
            )
          )
        )}
        
        {/* Modal de Vista Previa */}
        {showPreview && previewAd && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-700/50">
              <div className="bg-gradient-to-r from-blue-500/20 to-emerald-500/20 backdrop-blur border-b border-slate-700/50 p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    Vista previa: {previewAd.title}
                  </h3>
                  <button 
                    onClick={closePreview}
                    className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700/50 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-8 flex flex-col items-center">
                <h2 className="text-3xl font-bold mb-6 text-center">{previewAd.title}</h2>
                
                <div className="my-6 w-full flex justify-center">
                  {previewAd.media_url ? (
                    previewAd.media_type === 'video' ? (
                      <video 
                        className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-2xl" 
                        src={previewAd.media_url} 
                        controls 
                      />
                    ) : (
                      <img 
                        className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-2xl" 
                        src={previewAd.media_url} 
                        alt={previewAd.title} 
                      />
                    )
                  ) : (
                    <div className="w-full max-w-lg h-64 bg-slate-700/50 flex items-center justify-center rounded-xl border border-slate-600/50">
                      <p className="text-slate-400">No hay contenido multimedia disponible</p>
                    </div>
                  )}
                </div>
                
                {previewAd.description && (
                  <p className="text-slate-300 max-w-2xl text-center mt-6 text-lg">
                    {previewAd.description}
                  </p>
                )}
              </div>
              
              <div className="border-t border-slate-700/50 p-6 flex justify-end bg-slate-800/50">
                <button 
                  onClick={closePreview}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Cerrar Vista Previa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}