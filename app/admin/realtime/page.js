'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import supabase from '@/lib/supabaseClient';

import { Car, Monitor, Globe, Cpu, Wifi, MapPin, Calendar, Clock, RefreshCw, 
  Search, Server, AlertCircle, Smartphone, Laptop, Battery, Zap, Activity, Eye,
  CheckCircle, XCircle, Info, ArrowUpDown, Filter } from 'lucide-react';

// Constants
const OFFLINE_THRESHOLD_MINUTES = 5;
const RECONNECT_MAX_ATTEMPTS = 10; // Maximum number of reconnection attempts

export default function DeviceMonitoringDashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('online'); // Por defecto solo mostrar activos
  const [sortBy, setSortBy] = useState('last_seen');
  const [sortOrder, setSortOrder] = useState('desc');
  const [realtimeStatus, setRealtimeStatus] = useState('disconnected');
  const [realtimeNotification, setRealtimeNotification] = useState(null);
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    uniqueLocations: 0,
    totalAdViews: 0
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [reconnectCount, setReconnectCount] = useState(0);
  
  // Referencias para canales
  const reconnectTimeoutRef = useRef(null);
  const channelsRef = useRef({ devices: null, adViews: null });
  

// Función para actualizar dispositivos offline
 async function updateOfflineDevices() {
  const thresholdTime = new Date(Date.now() - OFFLINE_THRESHOLD_MINUTES * 60 * 1000).toISOString();
  
  try {
    const { error } = await supabase
      .from('connected_devices')
      .update({ status: 'offline' })
      .eq('status', 'online')
      .lt('last_seen', thresholdTime);
      
    if (error) {
      console.error('Error updating offline devices:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in updateOfflineDevices:', err);
    return false;
  }
}

// Función para obtener el conteo de dispositivos online
 async function getOnlineDevicesCount() {
  try {
    // Primero actualizar dispositivos offline
    await updateOfflineDevices();
    
    // Luego contar dispositivos online
    const { count, error } = await supabase
      .from('connected_devices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'online');
      
    if (error) {
      console.error('Error counting online devices:', error);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    console.error('Error in getOnlineDevicesCount:', err);
    return 0;
  }
}

// Función para obtener todos los dispositivos
 async function getAllDevices() {
  try {
    // Primero actualizar dispositivos offline
    await updateOfflineDevices();
    
    // Obtener todos los dispositivos
    const { data, error } = await supabase
      .from('connected_devices')
      .select('*')
      .order('last_seen', { ascending: false });
      
    if (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error in getAllDevices:', err);
    return [];
  }
}

// Función para obtener estadísticas
 function calculateDeviceStats(devices) {
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const uniqueLocations = new Set(devices.filter(d => d.location).map(d => d.location)).size;
  
  return {
    totalDevices: devices.length,
    onlineDevices,
    uniqueLocations
  };
}

// Función para verificar si un dispositivo está realmente online
function isDeviceOnline(lastSeenDate) {
  if (!lastSeenDate) return false;
  
  const lastSeen = new Date(lastSeenDate);
  const now = new Date();
  const diffMinutes = (now - lastSeen) / (1000 * 60);
  
  return diffMinutes < OFFLINE_THRESHOLD_MINUTES;
}
  // Función para cargar datos desde Supabase
  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      console.log('🔄 Fetching latest device data...');
      
      // Obtener todos los dispositivos usando el servicio compartido
      const devicesData = await getAllDevices();
      
      console.log(`✅ Loaded ${devicesData.length} devices`);
      console.log('Device details:', devicesData.map(d => ({
        name: d.name,
        status: d.status,
        last_seen: d.last_seen,
        ip: d.ip
      })));
      
      setDevices(devicesData);
      
      // Calcular estadísticas usando el servicio compartido
      const stats = calculateDeviceStats(devicesData);
      setStats(prev => ({ ...prev, ...stats }));
      
      // Obtener conteo de visualizaciones
      const { count, error: adViewsError } = await supabase
        .from('ad_views')
        .select('*', { count: 'exact', head: true });
        
      if (!adViewsError && count !== null) {
        console.log(`✅ Total ad views: ${count}`);
        setStats(prev => ({ ...prev, totalAdViews: count }));
      }
      
      setLastUpdate(new Date());
      setError(null);
      return true;
      
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(`Error al cargar datos: ${err.message}`);
      return false;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);
  
  // Cargar datos iniciales
  useEffect(() => {
    console.log('🚀 Initializing dashboard...');
    
    // Cargar datos inicialmente
    loadData();
    
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [loadData]);
  
  // Configurar suscripciones de realtime como método principal de actualización
  useEffect(() => {
    let isMounted = true;
    
    const cleanupChannels = async () => {
      console.log('🧹 Cleaning up channels...');
      
      if (channelsRef.current.devices) {
        await supabase.removeChannel(channelsRef.current.devices);
        channelsRef.current.devices = null;
      }
      
      if (channelsRef.current.adViews) {
        await supabase.removeChannel(channelsRef.current.adViews);
        channelsRef.current.adViews = null;
      }
    };
    
    const setupRealtimeChannels = async () => {
      if (!isMounted) return;
      
      try {
        console.log(`🔌 Setting up realtime channels (attempt ${reconnectCount + 1})...`);
        setRealtimeStatus('connecting');
        
        // Limpiar canales existentes
        await cleanupChannels();
        
        // Canal para dispositivos con manejo mejorado de eventos
        const devicesChannel = supabase
          .channel(`devices-${Date.now()}`, {
            config: {
              presence: {
                key: 'admin-dashboard',
              },
            }
          })
          .on('presence', { event: 'sync' }, () => {
            console.log('👥 Presence state synchronized');
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('👋 New presences:', newPresences);
          })
          .on('postgres_changes', 
            {
              event: '*',
              schema: 'public',
              table: 'connected_devices'
            }, 
            (payload) => {
              if (!isMounted) return;
              
              console.log('📡 Device update received:', payload?.eventType || 'unknown', payload?.new?.id || 'unknown-id');
              
              // Validar que payload existe y tiene las propiedades necesarias
              if (!payload || !payload.eventType) {
                console.warn('Invalid payload received:', payload);
                return;
              }
              
              try {
                // Solo mostrar notificación para cambios importantes
                const isMinorUpdate = payload.eventType === 'UPDATE' && 
                                    payload.new && 
                                    Object.keys(payload.new).length <= 3;
                
                if (!isMinorUpdate && payload.eventType) {
                  setRealtimeNotification({
                    type: payload.eventType.toLowerCase(),
                    message: payload.eventType === 'INSERT' ? 'Nuevo dispositivo conectado' :
                             payload.eventType === 'UPDATE' ? 'Dispositivo actualizado' :
                             payload.eventType === 'DELETE' ? 'Dispositivo eliminado' :
                             'Cambio detectado'
                  });
                  
                  // Limpiar notificación después de 3 segundos
                  setTimeout(() => {
                    if (isMounted) setRealtimeNotification(null);
                  }, 3000);
                }
                
                // Actualizar datos en el estado según el tipo de evento
                if (payload.eventType === 'INSERT') {
                  // Añadir nuevo dispositivo al estado
                  setDevices(prevDevices => [payload.new, ...prevDevices]);
                  // Actualizar estadísticas
                  setStats(prev => ({
                    ...prev,
                    totalDevices: prev.totalDevices + 1,
                    onlineDevices: payload.new.status === 'online' ? prev.onlineDevices + 1 : prev.onlineDevices
                  }));
                } else if (payload.eventType === 'UPDATE') {
                  // Actualizar dispositivo existente
                  setDevices(prevDevices => 
                    prevDevices.map(device => 
                      device.id === payload.new.id ? {...device, ...payload.new} : device
                    )
                  );
                  // Si el estado cambió, actualizar contadores
                  if (payload.old.status !== payload.new.status) {
                    setStats(prev => ({
                      ...prev,
                      onlineDevices: 
                        payload.new.status === 'online' 
                          ? prev.onlineDevices + 1 
                          : Math.max(0, prev.onlineDevices - 1)
                    }));
                  }
                } else if (payload.eventType === 'DELETE') {
                  // Eliminar dispositivo del estado
                  setDevices(prevDevices => 
                    prevDevices.filter(device => device.id !== payload.old.id)
                  );
                  // Actualizar estadísticas
                  setStats(prev => ({
                    ...prev,
                    totalDevices: Math.max(0, prev.totalDevices - 1),
                    onlineDevices: payload.old.status === 'online' 
                      ? Math.max(0, prev.onlineDevices - 1) 
                      : prev.onlineDevices
                  }));
                }
                
                // Actualizar timestamp de última actualización
                setLastUpdate(new Date());
              } catch (err) {
                console.error('Error processing realtime update:', err);
                // Si hay un error procesando los datos, mejor recargar todo
                loadData(false);
              }
            }
          )
          .subscribe(async (status) => {
            if (!isMounted) return;
            
            console.log('📡 Devices channel status:', status);
            
            if (status === 'SUBSCRIBED') {
              setRealtimeStatus('connected');
              setReconnectCount(0);
              console.log('✅ Connected to devices channel');
              
              // Actualizar estado de presencia
              const presenceTrackStatus = await devicesChannel.track({
                user: 'admin',
                online_at: new Date().toISOString(),
              });
              
              if (presenceTrackStatus === 'ok') {
                console.log('✅ Presence tracking started');
              } else {
                console.warn('⚠️ Presence tracking failed:', presenceTrackStatus);
              }
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.error('❌ Devices channel error:', status);
              setRealtimeStatus('error');
              scheduleReconnect();
            }
          });
          
        channelsRef.current.devices = devicesChannel;
        
        // Canal para visualizaciones de anuncios
        const adViewsChannel = supabase
          .channel(`ad-views-${Date.now()}`)
          .on('postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'ad_views'
            },
            (payload) => {
              if (!isMounted) return;
              console.log('📡 Ad view recorded');
              
              // Incrementar contador de visualizaciones
              setStats(prev => ({
                ...prev,
                totalAdViews: prev.totalAdViews + 1
              }));
            }
          )
          .subscribe((status) => {
            if (!isMounted) return;
            console.log('📡 Ad views channel status:', status);
            
            if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              console.error('❌ Ad views channel error:', status);
              // Reconectar solo este canal específico
              setTimeout(() => {
                if (isMounted && channelsRef.current.adViews) {
                  console.log('🔄 Reconnecting ad views channel...');
                  channelsRef.current.adViews.subscribe();
                }
              }, 5000);
            }
          });
          
        channelsRef.current.adViews = adViewsChannel;
        
      } catch (err) {
        console.error('❌ Error setting up realtime:', err);
        setError(`Error de conexión realtime: ${err.message}`);
        setRealtimeStatus('error');
        scheduleReconnect();
      }
    };
    
    // Programar reconexión con backoff exponencial mejorado
    const scheduleReconnect = () => {
      if (!isMounted || reconnectCount >= RECONNECT_MAX_ATTEMPTS) {
        console.log(`🚫 Max reconnection attempts (${RECONNECT_MAX_ATTEMPTS}) reached or component unmounted`);
        setRealtimeStatus('disabled');
        return;
      }
      
      const delay = Math.min(1000 * Math.pow(1.5, reconnectCount), 30000);
      console.log(`⏱️ Scheduling reconnect in ${delay/1000}s (attempt ${reconnectCount + 1}/${RECONNECT_MAX_ATTEMPTS})...`);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (isMounted) {
          setReconnectCount(prev => prev + 1);
          setupRealtimeChannels();
        }
      }, delay);
    };
    
    // Manejador de eventos de conexión a internet
    const handleOnlineStatus = () => {
      if (navigator.onLine) {
        console.log('🌐 Browser back online, reconnecting...');
        if (realtimeStatus !== 'connected') {
          setReconnectCount(0); // Reiniciar contador para forzar reconexión inmediata
          setupRealtimeChannels();
        }
      } else {
        console.log('🌐 Browser offline, waiting for connection...');
        setRealtimeStatus('error');
      }
    };
    
    // Añadir event listeners para detectar cambios en la conexión
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Iniciar conexión realtime
    setupRealtimeChannels();
    
    // Cleanup
    return () => {
      isMounted = false;
      cleanupChannels();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, [reconnectCount, loadData]);
  
  // Reconexión manual de realtime
  const handleReconnect = () => {
    setRealtimeNotification({ type: 'update', message: 'Reconectando tiempo real...' });
    
    // Reiniciar contador para forzar reconexión inmediata
    setReconnectCount(0);
    
    setTimeout(() => setRealtimeNotification(null), 3000);
  };
  
  // Filtrar y ordenar dispositivos
  const filteredDevices = devices.filter(device => {
    const matchesSearch = searchQuery === '' || 
      (device.name && device.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (device.ip && device.ip.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (device.location && device.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (device.os && device.os.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filter === 'all' || 
      (filter === 'online' && device.status === 'online') ||
      (filter === 'offline' && device.status === 'offline');
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortBy === 'last_seen') {
      return sortOrder === 'desc' 
        ? new Date(b.last_seen || 0) - new Date(a.last_seen || 0)
        : new Date(a.last_seen || 0) - new Date(b.last_seen || 0);
    } else if (sortBy === 'name') {
      return sortOrder === 'desc'
        ? (b.name || '').localeCompare(a.name || '')
        : (a.name || '').localeCompare(b.name || '');
    } else if (sortBy === 'location') {
      return sortOrder === 'desc'
        ? (b.location || '').localeCompare(a.location || '')
        : (a.location || '').localeCompare(b.location || '');
    }
    return 0;
  });

  // Formatear tiempo relativo
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Desconocido';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return `hace ${diffSec} segundos`;
    if (diffMin < 60) return `hace ${diffMin} minutos`;
    if (diffHour < 24) return `hace ${diffHour} horas`;
    if (diffDay < 30) return `hace ${diffDay} días`;
    
    return date.toLocaleDateString();
  };

  // Obtener icono del dispositivo
  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-5 h-5 text-blue-400" />;
      case 'tablet': return <Smartphone className="w-5 h-5 text-purple-400" />;
      case 'desktop': return <Laptop className="w-5 h-5 text-emerald-400" />;
      default: return <Monitor className="w-5 h-5 text-slate-400" />;
    }
  };
  
  // Obtener color de estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'offline': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };



  
  
  // Obtener estado de conexión realtime
  const getRealtimeStatusDisplay = () => {
    switch (realtimeStatus) {
      case 'connected':
        return {
          color: 'emerald',
          text: '🟢 Tiempo real activo',
          description: 'Actualizaciones instantáneas',
          icon: <CheckCircle className="w-4 h-4 mr-2" />
        };
      case 'connecting':
        return {
          color: 'amber',
          text: '🟡 Conectando...',
          description: 'Estableciendo conexión',
          icon: <Activity className="w-4 h-4 mr-2 animate-pulse" />
        };
      case 'error':
        return {
          color: 'red',
          text: '🔴 Sin tiempo real',
          description: reconnectCount < RECONNECT_MAX_ATTEMPTS ? `Reintento ${reconnectCount}/${RECONNECT_MAX_ATTEMPTS}` : 'Reconexión fallida',
          icon: <AlertCircle className="w-4 h-4 mr-2" />
        };
      case 'disabled':
        return {
          color: 'slate',
          text: '⚪ Desconectado',
          description: 'Conexión desactivada',
          icon: <Clock className="w-4 h-4 mr-2" />
        };
      default:
        return {
          color: 'slate',
          text: '⚪ Iniciando...',
          description: 'Preparando conexión',
          icon: <XCircle className="w-4 h-4 mr-2" />
        };
    }
  };

  const realtimeDisplay = getRealtimeStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Notificaciones */}
      {realtimeNotification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-lg shadow-2xl backdrop-blur-md border ${
            realtimeNotification.type === 'insert' ? 'bg-green-500/90 border-green-400' :
            realtimeNotification.type === 'update' ? 'bg-blue-500/90 border-blue-400' :
            realtimeNotification.type === 'delete' ? 'bg-red-500/90 border-red-400' :
            'bg-slate-500/90 border-slate-400'
          }`}>
            <div className="flex items-center space-x-3 text-white">
              <span className="font-medium">{realtimeNotification.message}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent flex items-center">
              <Car className="w-10 h-10 mr-3 text-orange-500" />
              Dispositivos Conectados
            </h1>
            <div className="text-right">
              <p className="text-xs text-slate-400">Última actualización</p>
              <p className="text-sm text-slate-300">{lastUpdate.toLocaleTimeString()}</p>
            </div>
          </div>
          <p className="text-slate-300 text-lg">Monitoreo en tiempo real de dispositivos Publi-Taxi</p>
        </div>
        
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-300">Total Dispositivos</h3>
              <Monitor className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalDevices}</p>
            <p className="text-slate-400 text-sm mt-2">Registrados</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-300">Activos</h3>
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.onlineDevices}</p>
            <p className="text-slate-400 text-sm mt-2">En línea ahora</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-300">Ubicaciones</h3>
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.uniqueLocations}</p>
            <p className="text-slate-400 text-sm mt-2">Distintas</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-300">Visualizaciones</h3>
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalAdViews}</p>
            <p className="text-slate-400 text-sm mt-2">Total anuncios</p>
          </div>
        </div>
        
        {/* Estado de conexión */}
        <div className={`mb-6 p-4 rounded-xl backdrop-blur bg-${realtimeDisplay.color}-500/10 border border-${realtimeDisplay.color}-500/30`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-medium">{realtimeDisplay.text}</span>
              <span className="text-sm text-slate-400">{realtimeDisplay.description}</span>
            </div>
            {realtimeStatus === 'error' && reconnectCount < RECONNECT_MAX_ATTEMPTS && (
              <button 
                onClick={handleReconnect}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs"
              >
                <RefreshCw className="w-4 h-4 mr-2 inline" />
                Reconectar
              </button>
            )}
          </div>
        </div>
        
        {/* Error global */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-6 backdrop-blur">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}
        
        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-1/2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, IP, ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-slate-600 bg-slate-700/50 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white"
            />
          </div>
          
          <div className="flex space-x-4">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todos</option>
              <option value="online">En línea</option>
              <option value="offline">Sin conexión</option>
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="last_seen">Última conexión</option>
              <option value="name">Nombre</option>
              <option value="location">Ubicación</option>
            </select>
            
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 hover:bg-slate-600/50 transition-colors"
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>
        
        {/* Lista de dispositivos */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-300 text-lg">Cargando dispositivos...</p>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur rounded-xl overflow-hidden border border-slate-700/50 shadow-xl">
            {filteredDevices.length === 0 ? (
              <div className="p-12 text-center">
                <Car className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No se encontraron dispositivos</p>
                <p className="text-slate-500 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-700">
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Dispositivo</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Última conexión</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Sistema</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Ubicación</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Red</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Batería</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Anuncio actual</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevices.map((device, index) => (
                      <tr 
                        key={device.id} 
                        className={`${index % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/10'} hover:bg-slate-700/30 transition-colors`}
                      >
                        {/* Estado */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                            {device.status === 'online' ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                                En línea
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-red-400 mr-1.5"></span>
                                Offline
                              </>
                            )}
                          </span>
                        </td>
                        
                        {/* Dispositivo */}
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center border border-slate-600/50 mr-3">
                              {getDeviceIcon(device.device_type)}
                            </div>
                            <div>
                              <div className="font-medium text-white">{device.name || 'Sin nombre'}</div>
                              <div className="text-xs text-slate-400">{device.ip || 'IP desconocida'}</div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Última conexión */}
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-slate-300">{formatRelativeTime(device.last_seen)}</span>
                          </div>
                        </td>
                        
                        {/* Sistema */}
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Cpu className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-slate-300">{device.os || 'Desconocido'}</span>
                          </div>
                        </td>
                        
                        {/* Ubicación */}
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-slate-300">{device.location || 'Desconocida'}</span>
                          </div>
                        </td>
                        
                        {/* Red */}
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Wifi className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-slate-300">{device.network || 'Desconocida'}</span>
                          </div>
                        </td>
                        
                        {/* Batería */}
                        <td className="px-4 py-3">
                          {device.battery ? (
                            <div className="flex items-center">
                              <Battery className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-slate-700/50 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full ${
                                      device.battery > 60 ? 'bg-emerald-400' : 
                                      device.battery > 20 ? 'bg-amber-400' : 'bg-red-400'
                                    }`} 
                                    style={{ width: `${device.battery}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-slate-400">{device.battery}%</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">-</span>
                          )}
                        </td>
                        
                        {/* Anuncio actual */}
                        <td className="px-4 py-3">
                          {device.current_ad ? (
                            <div className="max-w-[200px] truncate text-sm text-slate-300">
                              {device.current_ad}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-500">Sin anuncio</span>
                          )}
                        </td>
                        
                        {/* Info adicional */}
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <div title="Primera conexión" className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                              {device.first_seen ? new Date(device.first_seen).toLocaleDateString() : 'N/A'}
                            </div>
                            {device.resolution && (
                              <div title="Resolución" className="flex items-center">
                                <Monitor className="w-3.5 h-3.5 mr-1 text-slate-500" />
                                {device.resolution}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
  )
  
}