'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import supabase from '@/lib/supabaseClient';
import { Car, Monitor, Globe, Cpu, Wifi, MapPin, Calendar, Clock, RefreshCw, 
  Search, Server, AlertCircle, Smartphone, Laptop, Battery, Zap, Activity, Eye } from 'lucide-react';

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
  const [nextPollTime, setNextPollTime] = useState(10);
  
  // Referencias para intervalos y canales
  const pollIntervalRef = useRef(null);
  const pollTimerRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const channelsRef = useRef({ devices: null, adViews: null });
  
  // Función para cargar datos desde Supabase
  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      console.log('🔄 Fetching latest device data...');
      
      // Primero, actualizar dispositivos offline (más de 5 minutos sin heartbeat)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { error: updateError } = await supabase
        .from('connected_devices')
        .update({ status: 'offline' })
        .eq('status', 'online')
        .lt('last_seen', fiveMinutesAgo);
        
      if (updateError) {
        console.error('Error updating offline devices:', updateError);
      }
      
      // Obtener dispositivos
      const { data: devicesData, error: devicesError } = await supabase
        .from('connected_devices')
        .select('*')
        .order('last_seen', { ascending: false });

      if (devicesError) {
        console.error('Error loading devices:', devicesError);
        throw devicesError;
      }
      
      if (devicesData) {
        console.log(`✅ Loaded ${devicesData.length} devices`);
        console.log('Device details:', devicesData.map(d => ({
          name: d.name,
          status: d.status,
          last_seen: d.last_seen,
          ip: d.ip
        })));
        setDevices(devicesData);
        updateStats(devicesData);
      }
      
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
  
  // Actualizar estadísticas
  const updateStats = useCallback((devicesList) => {
    const onlineDevices = devicesList.filter(d => d.status === 'online').length;
    const uniqueLocations = new Set(devicesList.filter(d => d.location).map(d => d.location)).size;
    
    setStats(prev => ({
      ...prev,
      totalDevices: devicesList.length,
      onlineDevices,
      uniqueLocations
    }));
  }, []);
  
  // Configurar polling como método principal
  useEffect(() => {
    console.log('🚀 Initializing dashboard...');
    
    // Cargar datos inicialmente
    loadData();
    
    // Configurar contador de tiempo para siguiente actualización
    const updateNextPollTime = () => {
      setNextPollTime(prev => {
        if (prev <= 0) return 10;
        return prev - 1;
      });
    };
    
    // Timer para mostrar cuenta regresiva
    pollTimerRef.current = setInterval(updateNextPollTime, 1000);
    
    // Polling cada 10 segundos (temporalmente más frecuente para debugging)
    pollIntervalRef.current = setInterval(() => {
      console.log('⏰ Polling update...');
      loadData(false);
      setNextPollTime(10);
    }, 10000);
    
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [loadData]);
  
  // Configurar suscripciones de realtime (opcional, con mejor manejo de errores)
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
        
        // Canal para dispositivos
        const devicesChannel = supabase
          .channel(`devices-${Date.now()}`)
          .on('postgres_changes', 
            {
              event: '*',
              schema: 'public',
              table: 'connected_devices'
            }, 
            (payload) => {
              if (!isMounted) return;
              
              console.log('📡 Device update received:', payload?.eventType || 'unknown');
              
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
                
                // Recargar datos
                loadData(false);
              } catch (err) {
                console.error('Error processing realtime update:', err);
              }
            }
          )
          .subscribe((status) => {
            if (!isMounted) return;
            
            console.log('📡 Devices channel status:', status);
            
            if (status === 'SUBSCRIBED') {
              setRealtimeStatus('connected');
              setReconnectCount(0);
              console.log('✅ Connected to devices channel');
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
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
              loadData(false);
            }
          )
          .subscribe((status) => {
            if (!isMounted) return;
            console.log('📡 Ad views channel status:', status);
            
            if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              console.error('❌ Ad views channel error:', status);
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
    
    // Programar reconexión con backoff exponencial
    const scheduleReconnect = () => {
      if (!isMounted || reconnectCount >= 5) {
        console.log('🚫 Max reconnection attempts reached or component unmounted');
        setRealtimeStatus('disabled');
        return;
      }
      
      const delay = Math.min(2000 * Math.pow(1.5, reconnectCount), 30000);
      console.log(`⏱️ Scheduling reconnect in ${delay/1000}s...`);
      
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
    
    // Iniciar conexión realtime
    setupRealtimeChannels();
    
    // Cleanup
    return () => {
      isMounted = false;
      cleanupChannels();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [reconnectCount, loadData]);
  
  // Actualización manual
  const handleManualRefresh = async () => {
    setRealtimeNotification({ type: 'update', message: 'Actualizando datos...' });
    const success = await loadData(true);
    
    if (success) {
      setRealtimeNotification({ type: 'update', message: '✅ Datos actualizados' });
      setNextPollTime(10);
    } else {
      setRealtimeNotification({ type: 'delete', message: '❌ Error al actualizar' });
    }
    
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
          description: 'Actualizaciones instantáneas'
        };
      case 'connecting':
        return {
          color: 'amber',
          text: '🟡 Conectando...',
          description: 'Estableciendo conexión'
        };
      case 'error':
        return {
          color: 'red',
          text: '🔴 Sin tiempo real',
          description: reconnectCount < 5 ? `Reintento ${reconnectCount}/5` : 'Usando polling'
        };
      case 'disabled':
        return {
          color: 'slate',
          text: '⚪ Modo polling',
          description: 'Actualización cada 30s'
        };
      default:
        return {
          color: 'slate',
          text: '⚪ Desconectado',
          description: 'Sin conexión'
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent flex items-center">
              <Car className="w-10 h-10 mr-3 text-orange-500" />
              Dispositivos Conectados
            </h1>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleManualRefresh}
                disabled={loading}
                className={`${loading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-orange-600 hover:bg-orange-700'} 
                  text-white px-4 py-2 rounded-xl font-medium flex items-center transition-colors`}
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
              <div className="text-right">
                <p className="text-xs text-slate-400">Última actualización</p>
                <p className="text-sm text-slate-300">{lastUpdate.toLocaleTimeString()}</p>
              </div>
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
        
        {/* Estado de conexión y diagnóstico */}
        <div className={`mb-6 p-4 rounded-xl backdrop-blur bg-${realtimeDisplay.color}-500/10 border border-${realtimeDisplay.color}-500/30`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-medium">{realtimeDisplay.text}</span>
              <span className="text-sm text-slate-400">{realtimeDisplay.description}</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-slate-400">
                Próxima actualización: <span className="font-mono text-slate-300">{nextPollTime}s</span>
              </span>
              {realtimeStatus === 'error' && reconnectCount < 5 && (
                <button 
                  onClick={() => setReconnectCount(0)}
                  className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs"
                >
                  Reintentar ahora
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Panel de diagnóstico (temporal) */}
        <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">🔍 Diagnóstico</h4>
          <div className="grid grid-cols-2 gap-4 text-slate-400">
            <div>
              <p>Total dispositivos cargados: <span className="text-white">{devices.length}</span></p>
              <p>Dispositivos online: <span className="text-emerald-400">{devices.filter(d => d.status === 'online').length}</span></p>
              <p>Dispositivos offline: <span className="text-red-400">{devices.filter(d => d.status === 'offline').length}</span></p>
            </div>
            <div>
              <p>Filtro actual: <span className="text-white">{filter}</span></p>
              <p>Dispositivos filtrados: <span className="text-white">{filteredDevices.length}</span></p>
              <p>Última actualización: <span className="text-white">{lastUpdate.toLocaleTimeString()}</span></p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700">
            <p className="text-slate-400">Si no ves dispositivos activos, verifica que:</p>
            <ul className="text-slate-500 ml-4 mt-1">
              <li>• Los dispositivos en /display estén enviando heartbeats</li>
              <li>• La tabla connected_devices tenga registros con status=&apos;online&apos;</li>
              <li>• El campo last_seen sea reciente (menos de 5 minutos)</li>
              <li>• Las actualizaciones ocurren cada 10 segundos</li>
            </ul>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.length === 0 ? (
              <div className="col-span-full bg-slate-800/50 backdrop-blur rounded-2xl p-12 text-center border border-slate-700/50">
                <Car className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No se encontraron dispositivos</p>
                <p className="text-slate-500 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              filteredDevices.map(device => (
                <div key={device.id} className="bg-slate-800/50 backdrop-blur rounded-xl overflow-hidden border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]">
                  <div className="p-6 relative">
                    {/* Indicador de estado */}
                    <div className="absolute top-14 right-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                        {device.status === 'online' ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
                            En línea
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-red-400 mr-2"></span>
                            Sin conexión
                          </>
                        )}
                      </span>
                    </div>
                    
                    {/* Encabezado del dispositivo */}
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center border border-slate-600/50 mr-4">
                        {getDeviceIcon(device.device_type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{device.name || 'Sin nombre'}</h3>
                        <p className="text-slate-400 text-sm flex items-center">
                          <Globe className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          {device.ip || 'IP desconocida'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Detalles del dispositivo */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-slate-400 mr-2" />
                          <div>
                            <p className="text-xs text-slate-500">Última vez</p>
                            <p className="text-sm text-slate-300">{formatRelativeTime(device.last_seen)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                          <div>
                            <p className="text-xs text-slate-500">Ubicación</p>
                            <p className="text-sm text-slate-300">{device.location || 'Desconocida'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center">
                          <Cpu className="w-4 h-4 text-slate-400 mr-2" />
                          <div>
                            <p className="text-xs text-slate-500">Sistema</p>
                            <p className="text-sm text-slate-300">{device.os || 'Desconocido'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Wifi className="w-4 h-4 text-slate-400 mr-2" />
                          <div>
                            <p className="text-xs text-slate-500">Red</p>
                            <p className="text-sm text-slate-300">{device.network || 'Desconocida'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Información adicional */}
                    {device.current_ad && (
                      <div className="mt-4 bg-slate-700/30 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Anuncio actual</p>
                        <p className="text-sm text-white font-medium truncate">{device.current_ad}</p>
                      </div>
                    )}
                    
                    {device.battery && device.status === 'online' && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-slate-400 flex items-center">
                            <Battery className="w-3.5 h-3.5 mr-1" />
                            Batería
                          </span>
                          <span className="text-xs text-slate-400">{device.battery}%</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all ${
                              device.battery > 60 ? 'bg-emerald-400' : 
                              device.battery > 20 ? 'bg-amber-400' : 'bg-red-400'
                            }`} 
                            style={{ width: `${device.battery}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Pie de página */}
                  <div className="bg-slate-900/30 border-t border-slate-700/50 px-6 py-3 flex justify-between items-center">
                    <span className="text-xs text-slate-400 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {device.first_seen ? new Date(device.first_seen).toLocaleDateString() : 'N/A'}
                    </span>
                    {device.resolution && (
                      <span className="text-xs text-slate-400">
                        {device.resolution}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}