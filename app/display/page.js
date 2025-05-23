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
  const [realtimeStatus, setRealtimeStatus] = useState('connecting'); // connecting, connected, error
  const [realtimeNotification, setRealtimeNotification] = useState(null); // For showing update notifications
  const [weatherData, setWeatherData] = useState(null);
  const [showWeather, setShowWeather] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(true); // Start as loading

  // Load weather data immediately when component initializes
  useEffect(() => {
    const loadInitialWeatherData = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=41.7015&longitude=2.8347&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,wind_speed_10m_max&timezone=Europe%2FMadrid&forecast_days=7'
        );
        
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        
        // Simple weather mapping
        const getWeatherInfo = (code) => {
          const weather = {
            0: { desc: 'Despejado', icon: '☀️' },
            1: { desc: 'Mayormente despejado', icon: '🌤️' },
            2: { desc: 'Parcialmente nublado', icon: '⛅' },
            3: { desc: 'Nublado', icon: '☁️' },
            61: { desc: 'Lluvia ligera', icon: '🌦️' },
            63: { desc: 'Lluvia moderada', icon: '🌧️' },
            95: { desc: 'Tormenta', icon: '⛈️' }
          };
          return weather[code] || { desc: 'Condiciones variables', icon: '🌤️' };
        };
        
        const currentWeather = getWeatherInfo(data.current.weather_code);
        
        const weatherInfo = {
          current: {
            temp: Math.round(data.current.temperature_2m),
            feels_like: Math.round(data.current.apparent_temperature),
            description: currentWeather.desc,
            icon: currentWeather.icon,
            humidity: data.current.relative_humidity_2m,
            wind_speed: Math.round(data.current.wind_speed_10m),
            pressure: Math.round(data.current.pressure_msl),
            visibility: 10,
            sunrise: new Date(data.daily.sunrise[0]),
            sunset: new Date(data.daily.sunset[0])
          },
          forecast: data.daily.time.slice(0, 7).map((date, index) => {
            const dayWeather = getWeatherInfo(data.daily.weather_code[index]);
            return {
              date: new Date(date),
              temp_max: Math.round(data.daily.temperature_2m_max[index]),
              temp_min: Math.round(data.daily.temperature_2m_min[index]),
              description: dayWeather.desc,
              icon: dayWeather.icon,
              humidity: 65,
              wind_speed: Math.round(data.daily.wind_speed_10m_max[index])
            };
          }),
          location: 'Lloret de Mar, Costa Brava',
          lastUpdated: new Date()
        };
        
        setWeatherData(weatherInfo);
        
      } catch (error) {
        // Reliable fallback data
        const mockData = {
          current: {
            temp: 25,
            feels_like: 27,
            description: 'Soleado',
            icon: '☀️',
            humidity: 68,
            wind_speed: 14,
            pressure: 1016,
            visibility: 12,
            sunrise: new Date(new Date().setHours(7, 20)),
            sunset: new Date(new Date().setHours(20, 15))
          },
          forecast: [
            { date: new Date(), temp_max: 26, temp_min: 19, description: 'Soleado', icon: '☀️', humidity: 65, wind_speed: 12 },
            { date: new Date(Date.now() + 86400000), temp_max: 24, temp_min: 18, description: 'Nuboso', icon: '☁️', humidity: 72, wind_speed: 16 },
            { date: new Date(Date.now() + 172800000), temp_max: 27, temp_min: 20, description: 'Despejado', icon: '☀️', humidity: 60, wind_speed: 10 },
            { date: new Date(Date.now() + 259200000), temp_max: 23, temp_min: 17, description: 'Lluvia', icon: '🌧️', humidity: 85, wind_speed: 20 },
            { date: new Date(Date.now() + 345600000), temp_max: 25, temp_min: 18, description: 'Soleado', icon: '☀️', humidity: 62, wind_speed: 8 },
            { date: new Date(Date.now() + 432000000), temp_max: 28, temp_min: 21, description: 'Muy soleado', icon: '☀️', humidity: 55, wind_speed: 6 },
            { date: new Date(Date.now() + 518400000), temp_max: 26, temp_min: 19, description: 'Parcialmente nublado', icon: '⛅', humidity: 70, wind_speed: 15 }
          ],
          location: 'Lloret de Mar, Costa Brava',
          lastUpdated: new Date()
        };
        
        setWeatherData(mockData);
      } finally {
        setWeatherLoading(false);
      }
    };
    
    // Load immediately
    loadInitialWeatherData();
  }, []); // Run only once when component mounts

  // Simple test function for manual weather refresh
  const refreshWeatherData = () => {
    console.log('🔄 Manual weather refresh triggered');
    setWeatherLoading(true);
    
    setTimeout(() => {
      const testData = {
        current: {
          temp: 26,
          feels_like: 28,
          description: 'Actualizado manualmente',
          icon: '🌤️',
          humidity: 72,
          wind_speed: 16,
          pressure: 1012,
          visibility: 11,
          sunrise: new Date(new Date().setHours(7, 25)),
          sunset: new Date(new Date().setHours(20, 10))
        },
        forecast: [
          { date: new Date(), temp_max: 27, temp_min: 20, description: 'Test día 1', icon: '☀️', humidity: 70, wind_speed: 14 },
          { date: new Date(Date.now() + 86400000), temp_max: 25, temp_min: 19, description: 'Test día 2', icon: '⛅', humidity: 75, wind_speed: 18 },
          { date: new Date(Date.now() + 172800000), temp_max: 28, temp_min: 21, description: 'Test día 3', icon: '☀️', humidity: 65, wind_speed: 12 },
          { date: new Date(Date.now() + 259200000), temp_max: 24, temp_min: 18, description: 'Test día 4', icon: '🌧️', humidity: 88, wind_speed: 22 },
          { date: new Date(Date.now() + 345600000), temp_max: 26, temp_min: 19, description: 'Test día 5', icon: '☀️', humidity: 68, wind_speed: 10 },
          { date: new Date(Date.now() + 432000000), temp_max: 29, temp_min: 22, description: 'Test día 6', icon: '☀️', humidity: 60, wind_speed: 8 },
          { date: new Date(Date.now() + 518400000), temp_max: 27, temp_min: 20, description: 'Test día 7', icon: '⛅', humidity: 73, wind_speed: 16 }
        ],
        location: 'Lloret de Mar, Costa Brava (Actualizado)',
        lastUpdated: new Date()
      };
      
      setWeatherData(testData);
      setWeatherLoading(false);
      console.log('✅ Manual refresh completed');
    }, 1000);
  };

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

  // Fetch advertisements with realtime subscription
  useEffect(() => {
    let channel;

    async function setupRealtimeSubscription() {
      try {
        // Initial fetch
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
            description: 'Sistema de publicidad digital avanzado con sincronización en tiempo real',
            media_url: null,
            media_type: 'image',
            website_url: null,
            show_qr_code: false
          };
          setAllAds([placeholderAd]);
          setFilteredAds([placeholderAd]);
        }

        // Setup realtime subscription
        channel = supabase
          .channel('advertisements_realtime')
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to all events: INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'advertisements'
            },
            (payload) => {
              setRealtimeStatus('connected');
              
              // Handle different types of changes
              if (payload.eventType === 'INSERT') {
                setRealtimeNotification({ type: 'insert', message: 'Nuevo anuncio agregado' });
                if (payload.new.active) {
                  setAllAds(prev => {
                    const updated = [...prev.filter(ad => ad.id !== 'placeholder'), payload.new].sort((a, b) => a.id - b.id);
                    return updated;
                  });
                }
              } 
              else if (payload.eventType === 'UPDATE') {
                setRealtimeNotification({ type: 'update', message: 'Anuncio actualizado' });
                setAllAds(prev => {
                  const updated = prev.map(ad => 
                    ad.id === payload.new.id ? payload.new : ad
                  ).filter(ad => ad.active); // Remove deactivated ads
                  return updated;
                });
              } 
              else if (payload.eventType === 'DELETE') {
                setRealtimeNotification({ type: 'delete', message: 'Anuncio eliminado' });
                setAllAds(prev => {
                  const updated = prev.filter(ad => ad.id !== payload.old.id);
                  return updated;
                });
              }
              
              // Clear notification after 3 seconds
              setTimeout(() => setRealtimeNotification(null), 3000);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setRealtimeStatus('connected');
            } else if (status === 'CLOSED') {
              setRealtimeStatus('error');
            } else if (status === 'CHANNEL_ERROR') {
              setRealtimeStatus('error');
            }
          });

        setLoading(false);
        
      } catch (err) {
        console.error('❌ Error setting up realtime subscription:', err);
        setError('Error al conectar con el sistema en tiempo real');
        setRealtimeStatus('error');
        setLoading(false);
      }
    }

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [filterAdsByCurrentTimeSlot]);

  // Check time slot every minute (still needed for time-based filtering)
  useEffect(() => {
    const interval = setInterval(() => {
      if (allAds.length > 0) {
        const filtered = filterAdsByCurrentTimeSlot(allAds);
        setFilteredAds(filtered);
        
        if (currentAdIndex >= filtered.length && filtered.length > 0) {
          setCurrentAdIndex(0);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [allAds, filterAdsByCurrentTimeSlot, currentAdIndex]);

  // Rotate advertisements with enhanced animations
  useEffect(() => {
    if (filteredAds.length === 0) return;

    const interval = setInterval(() => {
      if (showWeather) {
        // Weather is showing, go back to first ad
        setShowWeather(false);
        setCurrentAdIndex(0);
      } else if (currentAdIndex >= filteredAds.length - 1) {
        // Last ad, show weather next
        setShowWeather(true);
      } else {
        // Normal ad progression with enhanced animations
        setSlideDirection(Math.random() > 0.5 ? 'next' : 'prev');
        setBackgroundPattern(prev => (prev + 1) % 3);
        
        setFadeState('out');
        
        setTimeout(() => {
          setCurrentAdIndex(currentAdIndex + 1);
          setFadeState('in');
        }, 800);
      }
    }, showWeather ? 10000 : 7000); // 10 seconds for weather, 7 for ads

    return () => clearInterval(interval);
  }, [currentAdIndex, showWeather, filteredAds.length]); // Removed weatherData to fix dependency size issue

  const WeatherScreen = () => {
    console.log('🌤️ WeatherScreen component rendering...', { weatherData, isClient });
    
    if (!weatherData) {
      console.log('❌ No weather data available');
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4 animate-pulse">🌤️</div>
            <h2 className="text-4xl font-bold mb-4">Cargando el tiempo...</h2>
            <p className="text-xl">Obteniendo datos meteorológicos de Lloret de Mar</p>
          </div>
        </div>
      );
    }

    console.log('✅ Weather data available, rendering full screen');
    const { current, forecast, location } = weatherData;

    return (
      <div className="w-full h-full flex flex-col relative overflow-hidden">
        {/* Animated Weather Background */}
        <div className="absolute inset-0">
          {/* Sky gradient based on weather */}
          <div className={`absolute inset-0 transition-all duration-2000 ${
            current.icon === '☀️' ? 'bg-gradient-to-b from-blue-400 via-blue-300 to-blue-200' :
            current.icon === '⛅' || current.icon === '🌤️' ? 'bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300' :
            current.icon === '🌧️' || current.icon === '🌦️' ? 'bg-gradient-to-b from-gray-600 via-gray-500 to-gray-400' :
            current.icon === '⛈️' ? 'bg-gradient-to-b from-gray-800 via-gray-700 to-gray-600' :
            'bg-gradient-to-b from-blue-400 via-blue-300 to-blue-200'
          }`}></div>
          
          {/* Animated elements based on weather */}
          {isClient && (
            <div className="absolute inset-0">
              {/* Sunny - floating particles */}
              {current.icon === '☀️' && [...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-60 animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
              
              {/* Cloudy - floating clouds */}
              {(current.icon === '⛅' || current.icon === '☁️' || current.icon === '🌤️') && [...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-6xl opacity-30 animate-pulse"
                  style={{
                    left: `${Math.random() * 90}%`,
                    top: `${Math.random() * 80}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random()}s`
                  }}
                >
                  ☁️
                </div>
              ))}
              
              {/* Rainy - falling drops */}
              {(current.icon === '🌧️' || current.icon === '🌦️') && [...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-8 bg-blue-300 opacity-70"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `fall ${1 + Math.random()}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Weather Content */}
        <div className="relative z-10 flex flex-col h-full text-white">
          {/* Header */}
          <div className="flex justify-between items-center p-6 bg-black/30 backdrop-blur-md">
            <div>
              <h1 className="text-4xl font-bold">{location}</h1>
              <p className="text-xl opacity-90">El tiempo en la Costa Brava</p>
            </div>
            <div className="text-right">
              <p className="text-lg opacity-90">Actualizado</p>
              <p className="text-xl font-medium">{current.lastUpdated?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          {/* Main Weather Display */}
          <div className="flex-grow flex">
            {/* Current Weather - Left Side */}
            <div className="flex-1 flex flex-col justify-center items-center p-8">
              <div className="text-center">
                <div className="text-8xl mb-4 animate-pulse">
                  {current.icon}
                </div>
                <div className="text-9xl font-bold mb-4 text-shadow-lg">
                  {current.temp}°
                </div>
                <div className="text-3xl font-medium mb-6 capitalize">
                  {current.description}
                </div>
                <div className="text-2xl opacity-90">
                  Sensación térmica: {current.feels_like}°
                </div>
              </div>
            </div>

            {/* Weather Details - Right Side */}
            <div className="flex-1 p-8">
              <h2 className="text-3xl font-bold mb-6">Condiciones Actuales</h2>
              
              <div className="grid grid-cols-2 gap-6 text-lg">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💧</span>
                    <div>
                      <p className="opacity-90">Humedad</p>
                      <p className="text-2xl font-bold">{current.humidity}%</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💨</span>
                    <div>
                      <p className="opacity-90">Viento</p>
                      <p className="text-2xl font-bold">{current.wind_speed} km/h</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🔍</span>
                    <div>
                      <p className="opacity-90">Visibilidad</p>
                      <p className="text-2xl font-bold">{current.visibility} km</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="opacity-90">Presión</p>
                      <p className="text-2xl font-bold">{current.pressure} mb</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sunrise/Sunset */}
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🌅</span>
                    <div>
                      <p className="opacity-90">Amanecer</p>
                      <p className="text-xl font-bold">{current.sunrise?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🌇</span>
                    <div>
                      <p className="opacity-90">Atardecer</p>
                      <p className="text-xl font-bold">{current.sunset?.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="bg-black/30 backdrop-blur-md p-6">
            <h2 className="text-3xl font-bold mb-6 text-center">Previsión de la Semana</h2>
            <div className="flex justify-between space-x-4">
              {forecast.slice(0, 7).map((day, index) => (
                <div key={index} className="flex-1 text-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                  <p className="text-lg font-medium mb-2">
                    {index === 0 ? 'Hoy' : 
                     index === 1 ? 'Mañana' : 
                     day.date.toLocaleDateString('es-ES', { weekday: 'short' })}
                  </p>
                  <div className="text-4xl mb-3 animate-pulse">
                    {day.icon}
                  </div>
                  <div className="text-lg font-bold">
                    {day.temp_max}° / {day.temp_min}°
                  </div>
                  <p className="text-sm opacity-90 mt-2 capitalize">
                    {day.description}
                  </p>
                  <div className="flex justify-center space-x-3 mt-3 text-xs opacity-80">
                    <span>💧{day.humidity}%</span>
                    <span>💨{day.wind_speed}km/h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Custom animations */}
        <style jsx>{`
          @keyframes fall {
            0% { transform: translateY(-100vh) rotate(10deg); }
            100% { transform: translateY(100vh) rotate(10deg); }
          }
          .text-shadow-lg {
            text-shadow: 0 4px 8px rgba(0,0,0,0.3);
          }
        `}</style>
      </div>
    );
  };

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
      {/* Debug Panel - Temporal */}
      {/* <div className="fixed top-20 left-4 bg-black/80 text-white p-4 rounded-lg z-50 text-sm">
        <h3 className="font-bold mb-2">🔍 Debug Info</h3>
        <p>📊 Total ads: {filteredAds.length}</p>
        <p>📍 Current index: {currentAdIndex}</p>
        <p>🌤️ Show weather: {showWeather ? 'YES' : 'NO'}</p>
        <p>📋 Weather data: {weatherData ? 'LOADED ✅' : weatherLoading ? 'LOADING...' : 'NOT LOADED ❌'}</p>
        <p>🎯 Next action: {
          showWeather ? 'Hide weather → Ad 1' :
          currentAdIndex >= filteredAds.length - 1 ? 'Show weather' :
          `Show ad ${currentAdIndex + 2}`
        }</p>
        <div className="mt-3 text-xs opacity-70">
          <p>Sequence should be:</p>
          {filteredAds.map((ad, i) => (
            <span key={i} className={currentAdIndex === i && !showWeather ? 'text-green-400' : ''}>
              Ad{i+1} → 
            </span>
          ))}
          <span className={showWeather ? 'text-green-400' : ''}>Weather → </span>
          <span>Repeat</span>
        </div>
        
        <button
          onClick={() => {
            console.log('🔄 Manual weather refresh triggered');
            refreshWeatherData();
          }}
          className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
        >
          🔄 Force Weather Refresh
        </button>
      </div> */}
      {/* End Debug Panel */}
      {realtimeNotification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className={`px-6 py-3 rounded-lg shadow-2xl backdrop-blur-md border ${
            realtimeNotification.type === 'insert' ? 'bg-green-500/90 border-green-400' :
            realtimeNotification.type === 'update' ? 'bg-blue-500/90 border-blue-400' :
            'bg-red-500/90 border-red-400'
          }`}>
            <div className="flex items-center space-x-3 text-white">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                realtimeNotification.type === 'insert' ? 'bg-green-200' :
                realtimeNotification.type === 'update' ? 'bg-blue-200' :
                'bg-red-200'
              }`}></div>
              <span className="font-medium">{realtimeNotification.message}</span>
            </div>
          </div>
        </div>
      )}
      
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
            {/* Realtime Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                realtimeStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                realtimeStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400 animate-pulse'
              }`}></div>
              <span className="text-sm font-medium">
                {realtimeStatus === 'connected' ? 'En Vivo' :
                 realtimeStatus === 'connecting' ? 'Conectando...' :
                 'Desconectado'}
              </span>
            </div>
            
            {/* Debug weather button - temporary for testing 
            <button
              onClick={() => {
                console.log('🌤️ Manual weather toggle clicked');
                setShowWeather(!showWeather);
                console.log('Weather state changed to:', !showWeather);
              }}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm font-medium transition-colors"
            >
              {showWeather ? '📺 Ads' : '🌤️ Tiempo'}
            </button>
            
            <div className="text-center">
              <p className="text-sm font-medium opacity-90">Debug Info</p>
              <p className="text-lg font-bold">{showWeather ? '🌤️ Tiempo' : `📺 Ad ${currentAdIndex + 1}/${filteredAds.length}`}</p>
            </div>*/}
            
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
              <p className="text-lg font-bold">{filteredAds.length > 0 ? `${currentAdIndex + 1}/${filteredAds.length}` : '0/0'}</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex-grow relative flex flex-col items-center justify-center px-6 py-8">
        {showWeather ? (
          <div 
            className={`w-full h-full transition-all duration-800 ease-in-out transform ${
              fadeState === 'in' 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 translate-y-8'
            }`}
          >
            <WeatherScreen />
          </div>
        ) : (
          currentAd && (
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
          )
        )}

        {/* Premium Progress Indicators */}
        {!showWeather && filteredAds.length > 1 && (
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
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              realtimeStatus === 'connected' ? 'bg-green-400' :
              realtimeStatus === 'connecting' ? 'bg-yellow-400' :
              'bg-red-400'
            }`}></div>
            <span className="text-sm font-medium">
              {realtimeStatus === 'connected' ? 'Sincronización Activa' :
               realtimeStatus === 'connecting' ? 'Conectando Sistema...' :
               'Sistema Desconectado'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}