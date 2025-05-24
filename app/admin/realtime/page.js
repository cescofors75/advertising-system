'use client';

import { useState, useEffect, useRef } from 'react';
import supabase from '@/lib/supabaseClient';
import { Car, Monitor, Globe, Cpu, Wifi, MapPin, Calendar, Clock, RefreshCw, 
  Search, Server, AlertCircle, Smartphone, Laptop, Battery, Zap, Activity, Eye } from 'lucide-react';

export default function DeviceMonitoringDashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('last_seen');
  const [sortOrder, setSortOrder] = useState('desc');
  const [realtimeStatus, setRealtimeStatus] = useState('connecting');
  const [realtimeNotification, setRealtimeNotification] = useState(null);
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    uniqueLocations: 0,
    totalAdViews: 0
  });
  const channelRef = useRef(null);
  const adViewsChannelRef = useRef(null);
  const [lastUpdate, setLastUpdate] = useState(new Date()); // Add this to force re-renders
  
  // Load devices data with Supabase real-time subscription
  useEffect(() => {
    async function setupRealtimeSubscription() {
      try {
        setLoading(true);
        console.log('🔄 Setting up realtime subscription...');
        
        // Fetch current devices from Supabase
        const { data, error } = await supabase
          .from('connected_devices')
          .select('*')
          .order('last_seen', { ascending: false });

        if (error) throw error;
        
        if (data) {
          console.log(`✅ Loaded ${data.length} devices from database`);
          setDevices(data);
          updateStats(data);
        }
        
        // Fetch ad views count
        const { data: adViewsData, error: adViewsError } = await supabase
          .from('ad_views')
          .select('id', { count: 'exact' });
          
        if (!adViewsError && adViewsData) {
          console.log(`✅ Loaded ${adViewsData.length} ad views`);
          setStats(prev => ({ ...prev, totalAdViews: adViewsData.length }));
        }
        
        // Setup realtime subscription for connected_devices table
        if (channelRef.current) {
          console.log('⚠️ Removing existing channel subscription');
          supabase.removeChannel(channelRef.current);
        }
        
        console.log('🔌 Creating new channel subscription for connected_devices');
        channelRef.current = supabase
          .channel('devices-channel-' + Date.now())
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'connected_devices'
            },
            (payload) => {
              console.log('📡 Realtime event received:', payload.eventType, payload);
              setRealtimeStatus('connected');
              
              // Handle different types of changes
              if (payload.eventType === 'INSERT') {
                setRealtimeNotification({ type: 'insert', message: 'Nuevo dispositivo conectado' });
                
                setDevices(prev => {
                  const updated = [payload.new, ...prev];
                  updateStats(updated);
                  return updated;
                });
                
                // Force a UI update
                setLastUpdate(new Date());
              } 
              else if (payload.eventType === 'UPDATE') {
                // Always show notification for updates too
                setRealtimeNotification({ type: 'update', message: 'Dispositivo actualizado' });
                
                setDevices(prev => {
                  // Check if the device exists before updating
                  const deviceExists = prev.some(device => device.id === payload.new.id);
                  let updated;
                  
                  if (deviceExists) {
                    updated = prev.map(device => 
                      device.id === payload.new.id ? payload.new : device
                    );
                  } else {
                    // If device doesn't exist (which shouldn't happen, but just in case),
                    // add it to the list
                    updated = [payload.new, ...prev];
                  }
                  
                  console.log('📊 Updated devices state with new data');
                  updateStats(updated);
                  return updated;
                });
                
                // Force a UI update
                setLastUpdate(new Date());
              } 
              else if (payload.eventType === 'DELETE') {
                setRealtimeNotification({ type: 'delete', message: 'Dispositivo eliminado' });
                
                setDevices(prev => {
                  const updated = prev.filter(device => device.id !== payload.old.id);
                  updateStats(updated);
                  return updated;
                });
                
                // Force a UI update
                setLastUpdate(new Date());
              }
              
              // Clear notification after 3 seconds
              setTimeout(() => setRealtimeNotification(null), 3000);
            }
          )
          .subscribe((status) => {
            console.log('📡 Channel subscription status:', status);
            if (status === 'SUBSCRIBED') {
              setRealtimeStatus('connected');
              console.log('✅ Successfully subscribed to realtime updates');
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              console.error('❌ Channel error or closed:', status);
              setRealtimeStatus('error');
            }
          });

        // Also subscribe to ad_views to update stats
        if (adViewsChannelRef.current) {
          supabase.removeChannel(adViewsChannelRef.current);
        }
        
        adViewsChannelRef.current = supabase
          .channel('ad-views-channel-' + Date.now())
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'ad_views'
            },
            (payload) => {
              console.log('📡 New ad view received:', payload);
              setStats(prev => ({ ...prev, totalAdViews: prev.totalAdViews + 1 }));
              // Force a UI update
              setLastUpdate(new Date());
            }
          )
          .subscribe();

        setLoading(false);
        
      } catch (err) {
        console.error('❌ Error setting up realtime subscription:', err);
        setError('Error al conectar con el sistema en tiempo real: ' + err.message);
        setRealtimeStatus('error');
        setLoading(false);
      }
    }

    setupRealtimeSubscription();

    // Setup a reconnection interval every 5 minutes to keep the connection fresh
    const reconnectInterval = setInterval(() => {
      console.log('🔄 Refreshing realtime connection...');
      setupRealtimeSubscription();
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (adViewsChannelRef.current) {
        supabase.removeChannel(adViewsChannelRef.current);
      }
      clearInterval(reconnectInterval);
    };
  }, []);
  
  // Helper function to update stats based on current devices
  const updateStats = (devicesList) => {
    const onlineDevices = devicesList.filter(d => d.status === 'online').length;
    const uniqueLocations = new Set(devicesList.filter(d => d.location).map(d => d.location)).size;
    
    setStats(prev => ({
      ...prev,
      totalDevices: devicesList.length,
      onlineDevices,
      uniqueLocations
    }));
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    try {
      setLoading(true);
      console.log('🔄 Manual refresh triggered');
      
      // Fetch current devices from Supabase
      const { data, error } = await supabase
        .from('connected_devices')
        .select('*')
        .order('last_seen', { ascending: false });

      if (error) throw error;
      
      if (data) {
        console.log(`✅ Refreshed ${data.length} devices from database`);
        setDevices(data);
        updateStats(data);
      }
      
      // Fetch ad views count
      const { data: adViewsData, error: adViewsError } = await supabase
        .from('ad_views')
        .select('id', { count: 'exact' });
        
      if (!adViewsError && adViewsData) {
        console.log(`✅ Refreshed ${adViewsData.length} ad views`);
        setStats(prev => ({ ...prev, totalAdViews: adViewsData.length }));
      }
      
      // Force a UI update
      setLastUpdate(new Date());
      
      // Show success notification
      setRealtimeNotification({ type: 'update', message: 'Datos actualizados manualmente' });
      setTimeout(() => setRealtimeNotification(null), 3000);
      
    } catch (err) {
      console.error('❌ Error refreshing data:', err);
      setError('Error al actualizar los datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort devices
  const filteredDevices = devices.filter(device => {
    // Apply search filter
    const matchesSearch = searchQuery === '' || 
      (device.name && device.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (device.ip && device.ip.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (device.location && device.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (device.os && device.os.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Apply status filter
    const matchesFilter = filter === 'all' || 
      (filter === 'online' && device.status === 'online') ||
      (filter === 'offline' && device.status === 'offline');
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Sort by selected field
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

  // Format relative time
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

  // Get device icon based on device type
  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-5 h-5 text-blue-400" />;
      case 'tablet': return <Smartphone className="w-5 h-5 text-purple-400" />;
      case 'desktop': return <Laptop className="w-5 h-5 text-emerald-400" />;
      default: return <Monitor className="w-5 h-5 text-slate-400" />;
    }
  };
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'offline': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
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
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent flex items-center">
              <Car className="w-10 h-10 mr-3 text-orange-500" />
              Dispositivos Conectados
            </h1>
            <div className="flex space-x-4">
              <button 
                onClick={handleManualRefresh}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-medium flex items-center transition-colors"
                disabled={loading}
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
          <p className="text-slate-300 text-lg">Monitoreo en tiempo real de los dispositivos conectados al sistema Publi-Taxi</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-300">Total Dispositivos</h3>
              <Monitor className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalDevices}</p>
            <p className="text-slate-400 text-sm mt-2">Registrados en el sistema</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-300">Activos Ahora</h3>
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.onlineDevices}</p>
            <p className="text-slate-400 text-sm mt-2">Actualmente online</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-300">Ubicaciones</h3>
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.uniqueLocations}</p>
            <p className="text-slate-400 text-sm mt-2">Distintas localidades</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-300">Visualizaciones</h3>
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-4xl font-bold text-white">{stats.totalAdViews}</p>
            <p className="text-slate-400 text-sm mt-2">Anuncios mostrados</p>
          </div>
        </div>
        
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
              className="bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="online">En línea</option>
              <option value="offline">Sin conexión</option>
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
        
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6 backdrop-blur">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}
        
        {/* Realtime connection status */}
        <div className={`mb-6 p-4 rounded-xl backdrop-blur flex items-center justify-between ${
          realtimeStatus === 'connected' ? 'bg-emerald-500/10 border border-emerald-500/30' :
          realtimeStatus === 'connecting' ? 'bg-amber-500/10 border border-amber-500/30' :
          'bg-red-500/10 border border-red-500/30'
        }`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              realtimeStatus === 'connected' ? 'bg-emerald-400 animate-pulse' :
              realtimeStatus === 'connecting' ? 'bg-amber-400 animate-pulse' :
              'bg-red-400 animate-pulse'
            }`}></div>
            <span className={`font-medium ${
              realtimeStatus === 'connected' ? 'text-emerald-400' :
              realtimeStatus === 'connecting' ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {realtimeStatus === 'connected' ? 'Conexión en tiempo real activa' :
               realtimeStatus === 'connecting' ? 'Conectando al sistema en tiempo real...' :
               'Error de conexión en tiempo real'}
            </span>
          </div>
          
          <div className="text-slate-400 text-sm">
            {realtimeStatus === 'connected' 
              ? 'Dispositivos sincronizados automáticamente' 
              : realtimeStatus === 'connecting' 
                ? 'Estableciendo conexión...'
                : 'Haga clic en "Actualizar" para intentar de nuevo'}
          </div>
        </div>
        
        {/* Lista de dispositivos */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-300 text-lg">Cargando dispositivos conectados...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.length === 0 ? (
              <div className="col-span-full bg-slate-800/50 backdrop-blur rounded-2xl p-12 text-center border border-slate-700/50">
                <Car className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No se encontraron dispositivos que coincidan con los filtros</p>
              </div>
            ) : (
              filteredDevices.map(device => (
                <div key={`${device.id}-${lastUpdate.getTime()}`} className="bg-slate-800/50 backdrop-blur rounded-xl overflow-hidden border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]">
                  <div className="p-6 relative">
                    {/* Status indicator */}
                    <div className="absolute top-4 right-4">
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
                    
                    {/* Device header */}
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-purple-500/20 flex items-center justify-center border border-slate-600/50 mr-4">
                        {getDeviceIcon(device.device_type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{device.name || 'Dispositivo sin nombre'}</h3>
                        <p className="text-slate-400 text-sm flex items-center">
                          <Globe className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          {device.ip || 'IP desconocida'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Device details */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
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
                    
                    {/* Current advertisement info */}
                    {device.current_ad && (
                      <div className="bg-slate-700/30 rounded-lg p-3 mb-3">
                        <p className="text-xs text-slate-400 mb-1">Anuncio actual</p>
                        <p className="text-sm text-white font-medium truncate">{device.current_ad}</p>
                      </div>
                    )}
                    
                    {/* Time slot info */}
                    {device.current_time_slot && (
                      <div className="bg-slate-700/30 rounded-lg p-3 mb-3">
                        <p className="text-xs text-slate-400 mb-1">Franja horaria</p>
                        <p className="text-sm text-white font-medium">
                          {device.current_time_slot === 'morning' ? 'Mañana' : 
                           device.current_time_slot === 'afternoon' ? 'Tarde' : 
                           device.current_time_slot === 'night' ? 'Noche' : 
                           device.current_time_slot}
                        </p>
                      </div>
                    )}
                    
                    {/* Performance metrics */}
                    {device.status === 'online' && device.battery && (
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-slate-400">Batería</span>
                            <span className="text-xs text-slate-400">{device.battery}%</span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${
                              device.battery > 60 ? 'bg-emerald-400' : 
                              device.battery > 20 ? 'bg-amber-400' : 'bg-red-400'
                            }`} style={{ width: `${device.battery}%` }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="bg-slate-900/30 border-t border-slate-700/50 px-6 py-3 flex justify-between items-center">
                    <span className="text-xs text-slate-400 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      Registrado: {device.first_seen ? new Date(device.first_seen).toLocaleDateString() : 'Desconocido'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center">
                      <Monitor className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {device.resolution || 'Resolución desconocida'}
                    </span>
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