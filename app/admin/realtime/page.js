'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

import { Car, Monitor, Globe, Cpu, Wifi, MapPin, Calendar, Clock, RefreshCw, 
  Search, Server, AlertCircle, Smartphone, Laptop, Battery, Activity, Eye,
  CheckCircle, XCircle } from 'lucide-react';

// Constants
const OFFLINE_THRESHOLD_MINUTES = 5;
const POLL_INTERVAL_MS = 10000; // Poll every 10 seconds

export default function DeviceMonitoringDashboard() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('online'); // Por defecto solo mostrar activos
  const [sortBy, setSortBy] = useState('last_seen');
  const [sortOrder, setSortOrder] = useState('desc');
  const [realtimeStatus, setRealtimeStatus] = useState('connected');
  const [realtimeNotification, setRealtimeNotification] = useState(null);
  const [stats, setStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    uniqueLocations: 0,
    totalAdViews: 0
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Referencias
  const pollIntervalRef = useRef(null);
  

// Función para obtener todos los dispositivos vía API
 async function getAllDevices() {
  try {
    const res = await fetch('/api/devices');
    if (!res.ok) throw new Error('Error fetching devices');
    return await res.json();
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

  const getDeviceStatus = (device) => {
    if (!device) return 'offline';
    if (device.status === 'online' && !isDeviceOnline(device.last_seen)) {
      return 'stale';
    }
    return device.status || 'offline';
  };
  // Función para cargar datos desde API
  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      console.log('🔄 Fetching latest device data...');
      
      // Obtener todos los dispositivos usando la API
      const devicesData = await getAllDevices();
      
      console.log(`✅ Loaded ${devicesData.length} devices`);
      
      setDevices(devicesData);
      
      // Calcular estadísticas
      const stats = calculateDeviceStats(devicesData);
      setStats(prev => ({ ...prev, ...stats }));
      
      // Obtener conteo de visualizaciones vía API
      try {
        const viewsRes = await fetch('/api/ad-views?grouped=by_ad');
        if (viewsRes.ok) {
          const viewsData = await viewsRes.json();
          const totalViews = viewsData.reduce((sum, item) => sum + (item.view_count || 0), 0);
          setStats(prev => ({ ...prev, totalAdViews: totalViews }));
        }
      } catch (viewErr) {
        console.error('Error fetching ad views:', viewErr);
      }
      
      setLastUpdate(new Date());
      setError(null);
      setRealtimeStatus('connected');
      return true;
      
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(`Error al cargar datos: ${err.message}`);
      setRealtimeStatus('error');
      return false;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);
  
  // Cargar datos iniciales y configurar polling
  useEffect(() => {
    console.log('🚀 Initializing dashboard...');
    
    // Cargar datos inicialmente
    loadData();
    
    // Configurar polling para actualizaciones periódicas
    pollIntervalRef.current = setInterval(() => {
      loadData(false); // false = don't show loading spinner
    }, POLL_INTERVAL_MS);
    
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [loadData]);

  
  // Reconexión manual / refresco
  const handleReconnect = () => {
    setRealtimeNotification({ type: 'update', message: 'Actualizando datos...' });
    loadData(false);
    setTimeout(() => setRealtimeNotification(null), 3000);
  };
  
  // Filtrar y ordenar dispositivos
  const filteredDevices = devices.filter(device => {
    const resolvedStatus = getDeviceStatus(device);
    const matchesSearch = searchQuery === '' || 
      (device.name && device.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (device.ip && device.ip.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (device.location && device.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (device.os && device.os.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filter === 'all' || 
      (filter === 'online' && resolvedStatus === 'online') ||
      (filter === 'offline' && resolvedStatus === 'offline') ||
      (filter === 'stale' && resolvedStatus === 'stale');
    
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
      case 'stale': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };



  
  
  // Obtener estado de conexión
  const getRealtimeStatusDisplay = () => {
    switch (realtimeStatus) {
      case 'connected':
        return {
          color: 'emerald',
          text: '🟢 Polling activo',
          description: `Actualizaciones cada ${POLL_INTERVAL_MS / 1000}s`,
          icon: <CheckCircle className="w-4 h-4 mr-2" />
        };
      case 'error':
        return {
          color: 'red',
          text: '🔴 Error de conexión',
          description: 'No se pueden obtener datos',
          icon: <AlertCircle className="w-4 h-4 mr-2" />
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
  const realtimeStyles = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30',
    amber: 'bg-amber-500/10 border-amber-500/30',
    red: 'bg-red-500/10 border-red-500/30',
    slate: 'bg-slate-500/10 border-slate-500/30'
  };

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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-2">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent flex items-center">
              <Car className="w-10 h-10 mr-3 text-orange-500" />
              Dispositivos Conectados
            </h1>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-400">Última actualización</p>
                <p className="text-sm text-slate-300">{lastUpdate.toLocaleTimeString()}</p>
              </div>
              <button
                onClick={() => loadData()}
                className="px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg text-xs text-slate-200 border border-slate-700/50"
              >
                <RefreshCw className="w-4 h-4 mr-2 inline" />
                Actualizar
              </button>
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
        <div className={`mb-6 p-4 rounded-xl backdrop-blur border ${realtimeStyles[realtimeDisplay.color] || realtimeStyles.slate}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-medium">{realtimeDisplay.text}</span>
              <span className="text-sm text-slate-400">{realtimeDisplay.description}</span>
            </div>
            {realtimeStatus === 'error' && (
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
              <option value="stale">Inestable</option>
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
                    {filteredDevices.map((device, index) => {
                      const resolvedStatus = getDeviceStatus(device);
                      return (
                      <tr 
                        key={device.id} 
                        className={`${index % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/10'} hover:bg-slate-700/30 transition-colors`}
                      >
                        {/* Estado */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(resolvedStatus)}`}>
                            {resolvedStatus === 'online' ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                                En línea
                              </>
                            ) : resolvedStatus === 'stale' ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5"></span>
                                Inestable
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
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
  )
  
}