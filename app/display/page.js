'use client';

import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabaseClient';

// Brand colors
const ORANGE = "#ff8000";
const GRADIENT = "linear-gradient(135deg, #ff8000 0%, #ff6b00 50%, #e55a00 100%)";
const DARK_GRADIENT = "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #404040 100%)";

// Time slot definitions
const TIME_SLOTS = {
  morning: { name: 'Mañana', startHour: 0, endHour: 8, color: 'blue' },
  afternoon: { name: 'Tarde', startHour: 8, endHour: 16, color: 'green' },
  night: { name: 'Noche', startHour: 16, endHour: 24, color: 'purple' }
};

export default function DisplayPage() {
  const [allAds, setAllAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fadeState, setFadeState] = useState('in');
  const [currentTimeSlot, setCurrentTimeSlot] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [slideDirection, setSlideDirection] = useState('next');
  const [backgroundPattern, setBackgroundPattern] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Update time every second
  useEffect(() => {
    setIsClient(true); // Marcar que estamos en el cliente
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Función para obtener la franja horaria actual
  const getCurrentTimeSlot = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();

    for (const [slotKey, slot] of Object.entries(TIME_SLOTS)) {
      if (currentHour >= slot.startHour && currentHour < slot.endHour) {
        return slotKey;
      }
    }
    
    return 'night';
  }, []);

  // Función para determinar las franjas horarias de un anuncio
  const getAdTimeSlots = useCallback((ad) => {
    // Usar columnas time_slot_* si existen
    const timeSlotColumns = Object.keys(ad).filter(key => key.startsWith('time_slot_'));
    if (timeSlotColumns.length > 0) {
      const slots = [];
      
      if (ad.time_slot_morning === true || ad.time_slot_morning === 'true' || ad.time_slot_morning === 1) {
        slots.push('morning');
      }
      if (ad.time_slot_afternoon === true || ad.time_slot_afternoon === 'true' || ad.time_slot_afternoon === 1) {
        slots.push('afternoon');
      }
      if (ad.time_slot_night === true || ad.time_slot_night === 'true' || ad.time_slot_night === 1) {
        slots.push('night');
      }
      
      if (slots.length > 0) {
        return slots;
      }
    }
    
    return [];
  }, []);

  // Filtrar anuncios por franja horaria actual
  const filterAdsByCurrentTimeSlot = useCallback((ads) => {
    const currentSlot = getCurrentTimeSlot();
    setCurrentTimeSlot(currentSlot);

    const filtered = ads.filter(ad => {
      const adTimeSlots = getAdTimeSlots(ad);
      
      if (adTimeSlots.length === 0) {
        return false;
      }

      return adTimeSlots.includes(currentSlot);
    });

    return filtered;
  }, [getCurrentTimeSlot, getAdTimeSlots]);

  // Fetch advertisements
  useEffect(() => {
    async function fetchAds() {
      try {
        const { data, error } = await supabase
          .from('advertisements')
          .select('*')
          .eq('active', true)
          .order('id');

        if (error) throw error;
        
        if (data && data.length > 0) {
          setAllAds(data);
          const filtered = filterAdsByCurrentTimeSlot(data);
          setFilteredAds(filtered);
        } else {
          const placeholderAd = {
            id: 'placeholder',
            title: 'Bienvenido a Publi-Taxi',
            description: 'Sistema de publicidad digital avanzado',
            media_url: null,
            media_type: 'image',
            website_url: null,
            show_qr_code: false
          };
          setAllAds([placeholderAd]);
          setFilteredAds([placeholderAd]);
        }
      } catch (err) {
        console.error('Error fetching advertisements:', err);
        setError('Error al cargar anuncios');
      } finally {
        setLoading(false);
      }
    }

    fetchAds();
  }, [filterAdsByCurrentTimeSlot]);

  // Check time slot every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (allAds.length > 0) {
        const filtered = filterAdsByCurrentTimeSlot(allAds);
        setFilteredAds(filtered);
        
        if (currentAdIndex >= filtered.length) {
          setCurrentAdIndex(0);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [allAds, filterAdsByCurrentTimeSlot, currentAdIndex]);

  // Rotate advertisements with enhanced animations
  useEffect(() => {
    if (filteredAds.length <= 1) return;

    const interval = setInterval(() => {
      // Determine slide direction
      setSlideDirection(Math.random() > 0.5 ? 'next' : 'prev');
      
      // Change background pattern
      setBackgroundPattern(prev => (prev + 1) % 3);
      
      // Start transition
      setFadeState('out');
      
      setTimeout(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % filteredAds.length);
        setFadeState('in');
      }, 800);
    }, 7000); // 7 seconds between changes

    return () => clearInterval(interval);
  }, [filteredAds]);

  // Reset ad index when filtered ads change
  useEffect(() => {
    setCurrentAdIndex(0);
  }, [filteredAds]);

  const LoadingScreen = () => (
    <div className="flex flex-col h-screen bg-black relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-purple-500/30 to-blue-500/30 animate-pulse"></div>
        {/* Solo renderizar partículas en el cliente */}
        {isClient && [...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Header */}
      <header className="relative z-10 py-4 px-6" style={{ background: GRADIENT }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 bg-orange-500 rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Publi-Taxi</h1>
          </div>
          <div className="text-white/90 text-lg font-medium">Sistema Publicitario Digital</div>
        </div>
      </header>
      
      <div className="flex-grow flex items-center justify-center relative z-10">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse shadow-2xl"></div>
            <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-orange-300 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 animate-pulse">Cargando contenido...</h2>
          <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <footer className="relative z-10 py-3 px-6 bg-black/50 backdrop-blur-sm">
        <div className="text-center text-white/70">© 2025 Publi-Taxi - Tecnología Avanzada</div>
      </footer>
    </div>
  );

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {isClient && [...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <header className="relative z-10 py-4 px-6 bg-red-600">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Publi-Taxi</h1>
            <div className="text-red-100">Sistema en Mantenimiento</div>
          </div>
        </header>
        
        <div className="flex-grow flex flex-col items-center justify-center relative z-10 text-center px-8">
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-5xl font-bold text-white mb-6">Sistema Temporalmente Inactivo</h2>
          <p className="text-xl text-red-100 max-w-2xl leading-relaxed">{error}</p>
        </div>
        
        <footer className="relative z-10 py-3 px-6 bg-red-800/50 backdrop-blur-sm">
          <div className="text-center text-red-100">© 2025 Publi-Taxi - Soporte Técnico Disponible</div>
        </footer>
      </div>
    );
  }

  // Handle no ads for current time slot
  if (filteredAds.length === 0) {
    const timeSlotName = TIME_SLOTS[currentTimeSlot]?.name || 'actual';
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {isClient && [...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        <header className="relative z-10 py-4 px-6" style={{ background: GRADIENT }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
              </div>
              <h1 className="text-2xl font-bold text-white">Publi-Taxi</h1>
            </div>
            <div className="text-white/90 flex items-center space-x-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">{timeSlotName}</span>
              <span className="text-lg">{currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </header>
        
        <div className="flex-grow flex flex-col items-center justify-center relative z-10 px-8">
          <div className="text-center max-w-4xl">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tight">
              En pausa
            </h1>
            <p className="text-2xl md:text-3xl text-slate-300 leading-relaxed">
              No hay contenido programado para la franja horaria <span className="text-orange-400 font-semibold">{timeSlotName}</span>
            </p>
            <div className="mt-8 text-slate-400">
              <p>El sistema reanudará automáticamente cuando haya contenido disponible</p>
            </div>
          </div>
        </div>
        
        <footer className="relative z-10 py-3 px-6 bg-black/30 backdrop-blur-sm">
          <div className="text-center text-white/70">© 2025 Developed on the Costa Brava by VisitToo & VisitTech</div>
        </footer>
      </div>
    );
  }

  const currentAd = filteredAds[currentAdIndex];

  return (
    <div className="flex flex-col min-h-screen bg-black relative overflow-hidden">
      {/* Dynamic background patterns */}
      <div className="absolute inset-0">
        {/* Pattern 1: Geometric */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${backgroundPattern === 0 ? 'opacity-20' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-purple-500/10 to-blue-500/10"></div>
          {isClient && [...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-white/10 rounded-full animate-pulse"
              style={{
                width: `${100 + i * 50}px`,
                height: `${100 + i * 50}px`,
                left: `${10 + (i % 3) * 30}%`,
                top: `${20 + Math.floor(i / 3) * 25}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            />
          ))}
        </div>
        
        {/* Pattern 2: Flowing lines */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${backgroundPattern === 1 ? 'opacity-20' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 via-blue-500/10 to-purple-500/10"></div>
          {isClient && [...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
              style={{
                width: '200%',
                left: '-50%',
                top: `${10 + i * 12}%`,
                transform: `rotate(${15 + i * 5}deg)`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${4 + i * 0.2}s`
              }}
            />
          ))}
        </div>
        
        {/* Pattern 3: Particles */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${backgroundPattern === 2 ? 'opacity-20' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 via-pink-500/10 to-orange-500/10"></div>
          {isClient && [...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Premium Header */}
      <header className="relative z-20 py-4 px-6 backdrop-blur-md" style={{ background: 'linear-gradient(135deg, rgba(255, 128, 0, 0.95) 0%, rgba(255, 107, 0, 0.95) 50%, rgba(229, 90, 0, 0.95) 100%)' }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Publi-Taxi</h1>
              <p className="text-white/80 text-sm">Premium Digital Advertising</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-white">
            <div className="text-center">
              <p className="text-sm font-medium opacity-90">Franja Horaria</p>
              <p className="text-lg font-bold">{TIME_SLOTS[currentTimeSlot]?.name}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium opacity-90">Hora Actual</p>
              <p className="text-2xl font-bold font-mono">
                {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium opacity-90">Anuncios</p>
              <p className="text-lg font-bold">{currentAdIndex + 1}/{filteredAds.length}</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex-grow relative flex flex-col items-center justify-center px-6 py-8">
        {currentAd && (
          <div 
            className={`w-full max-w-7xl transition-all duration-800 ease-in-out transform ${
              fadeState === 'in' 
                ? 'opacity-100 scale-100 translate-y-0' 
                : `opacity-0 scale-95 ${slideDirection === 'next' ? 'translate-y-8' : '-translate-y-8'}`
            }`}
          >
            {/* Title with premium styling */}
            <div className="text-center mb-8">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-orange-400 mb-4 leading-tight tracking-tight">
                {currentAd.title}
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-orange-400 to-orange-600 mx-auto rounded-full"></div>
            </div>
            
            {/* Media Container with advanced styling */}
            <div className="relative w-full max-h-[60vh] mb-8 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-10"></div>
              
              {currentAd.media_url ? (
                currentAd.media_type === 'video' ? (
                  <video 
                    className="w-full h-full object-cover" 
                    src={currentAd.media_url} 
                    autoPlay 
                    muted 
                    loop
                    style={{ maxHeight: '60vh' }}
                  />
                ) : (
                  <div className="relative">
                    <img 
                      className="w-full h-full object-cover" 
                      src={currentAd.media_url} 
                      alt={currentAd.title}
                      style={{ maxHeight: '60vh' }}
                    />
                    {/* Premium QR Code */}
                    {currentAd.website_url && currentAd.show_qr_code && (
                      <div className="absolute bottom-6 right-6 z-20">
                        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-2xl border border-white/20">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentAd.website_url)}`}
                            alt="QR Code"
                            className="w-32 h-32 rounded-xl"
                          />
                          <p className="text-center text-xs font-medium text-gray-700 mt-2">Escanea para más info</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="w-full h-[50vh] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center rounded-3xl">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-2xl text-white font-medium">Contenido en preparación</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Description with premium styling */}
            {currentAd.description && (
              <div className="text-center">
                <p className="text-2xl md:text-3xl lg:text-4xl text-white leading-relaxed max-w-5xl mx-auto font-light">
                  <span className="bg-gradient-to-r from-white/90 to-orange-200/90 bg-clip-text text-transparent">
                    {currentAd.description}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Premium Progress Indicators */}
        {filteredAds.length > 1 && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-4">
            <div className="flex space-x-3">
              {filteredAds.map((_, index) => (
                <div key={index} className="relative">
                  <div 
                    className={`h-3 w-12 rounded-full transition-all duration-500 ${
                      index === currentAdIndex 
                        ? 'bg-gradient-to-r from-orange-400 to-orange-600 shadow-lg shadow-orange-500/50' 
                        : 'bg-white/30 backdrop-blur-sm'
                    }`}
                  />
                  {index === currentAdIndex && (
                    <div className="absolute inset-0 h-3 w-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Premium Footer */}
      <footer className="relative z-20 py-4 px-6 bg-black/80 backdrop-blur-md">
        <div className="flex justify-between items-center text-white/90">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full"></div>
            <span className="font-medium">© 2025 Publi-Taxi</span>
          </div>
          <div className="text-center flex-grow">
            <span className="text-sm">Developed on the Costa Brava by </span>
            <span className="font-semibold text-orange-400">VisitToo & VisitTech</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Sistema Activo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}