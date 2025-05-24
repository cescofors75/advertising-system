'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';
import { Car, Monitor, Globe, Cpu, Wifi, MapPin, Calendar, Clock, RefreshCw, Search, Server, AlertCircle, Smartphone, Laptop } from 'lucide-react';

export default function CarsPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('last_seen');
  const [sortOrder, setSortOrder] = useState('desc');

  // Cargar los datos de los dispositivos
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        
        // En una implementación real, esto vendría de una tabla en Supabase
        // Para la demostración, usamos datos de muestra
        const mockDevices = [
          {
            id: '1',
            name: 'Taxi 1',
            ip: '192.168.1.101',
            last_seen: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutos atrás
            os: 'Android 11',
            browser: 'Chrome 91',
            device_type: 'mobile',
            location: 'Lloret de Mar',
            status: 'online',
            network: 'WiFi',
            resolution: '1920x1080',
            user_agent: 'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
            first_seen: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días atrás
            battery: 87,
            memory_usage: 42,
            cpu_usage: 15
          },
          {
            id: '2',
            name: 'Hotel Recepción',
            ip: '192.168.1.102',
            last_seen: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutos atrás
            os: 'Windows 10',
            browser: 'Edge 94',
            device_type: 'desktop',
            location: 'Barcelona',
            status: 'online',
            network: 'Ethernet',
            resolution: '2560x1440',
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.71 Safari/537.36 Edg/94.0.992.38',
            first_seen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días atrás
            battery: 100,
            memory_usage: 68,
            cpu_usage: 22
          },
          {
            id: '3',
            name: 'Taxi 2',
            ip: '192.168.1.103',
            last_seen: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
            os: 'iOS 15',
            browser: 'Safari 15',
            device_type: 'tablet',
            location: 'Girona',
            status: 'offline',
            network: 'Cellular 4G',
            resolution: '2048x1536',
            user_agent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
            first_seen: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 días atrás
            battery: 32,
            memory_usage: 85,
            cpu_usage: 5
          },
          {
            id: '4',
            name: 'Restaurante Costa',
            ip: '192.168.1.104',
            last_seen: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
            os: 'macOS 12',
            browser: 'Firefox 93',
            device_type: 'desktop',
            location: 'Tossa de Mar',
            status: 'online',
            network: 'WiFi',
            resolution: '1440x900',
            user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_0) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/93.0',
            first_seen: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 días atrás
            battery: 76,
            memory_usage: 54,
            cpu_usage: 35
          },
          {
            id: '5',
            name: 'Taxi 3',
            ip: '192.168.1.105',
            last_seen: new Date().toISOString(), // ahora
            os: 'Android 12',
            browser: 'Chrome 95',
            device_type: 'mobile',
            location: 'Blanes',
            status: 'online',
            network: 'Cellular 5G',
            resolution: '2400x1080',
            user_agent: 'Mozilla/5.0 (Linux; Android 12; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.50 Mobile Safari/537.36',
            first_seen: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
            battery: 62,
            memory_usage: 37,
            cpu_usage: 28
          }
        ];
        
        setDevices(mockDevices);
      } catch (err) {
        console.error('Error al obtener dispositivos:', err);
        setError('No se pudieron cargar los dispositivos: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevices();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchDevices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Filtrar y ordenar dispositivos
  const filteredDevices = devices.filter(device => {
    // Aplicar filtro de búsqueda
    const matchesSearch = searchQuery === '' || 
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.os.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Aplicar filtro de estado
    const matchesFilter = filter === 'all' || 
      (filter === 'online' && device.status === 'online') ||
      (filter === 'offline' && device.status === 'offline');
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    // Ordenar por el campo seleccionado
    if (sortBy === 'last_seen') {
      return sortOrder === 'desc' 
        ? new Date(b.last_seen) - new Date(a.last_seen)
        : new Date(a.last_seen) - new Date(b.last_seen);
    } else if (sortBy === 'name') {
      return sortOrder === 'desc'
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name);
    } else if (sortBy === 'location') {
      return sortOrder === 'desc'
        ? b.location.localeCompare(a.location)
        : a.location.localeCompare(b.location);
    }
    return 0;
  });

  // Formatear tiempo relativo
  const formatRelativeTime = (dateString) => {
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

  // Obtener icono según tipo de dispositivo
  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-5 h-5 text-blue-400" />;
      case 'tablet': return <Smartphone className="w-5 h-5 text-purple-400" />;
      case 'desktop': return <Laptop className="w-5 h-5 text-emerald-400" />;
      default: return <Monitor className="w-5 h-5 text-slate-400" />;
    }
  };
  
  // Obtener color según estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'offline': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center">
              <Car className="w-10 h-10 mr-3 text-blue-400" />
              Dispositivos Conectados
            </h1>
            <button 
              onClick={() => window.location.reload()}
              className="bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white px-4 py-2 rounded-xl font-medium flex items-center transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Actualizar
            </button>
          </div>
          <p className="text-slate-300 text-lg">Monitoreo en tiempo real de dispositivos que muestran anuncios</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-300">Total Dispositivos</h3>
              <Monitor className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-4xl font-bold text-white">{devices.length}</p>
            <p className="text-slate-400 text-sm mt-2">Registrados en el sistema</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-300">Activos Ahora</h3>
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-4xl font-bold text-white">{devices.filter(d => d.status === 'online').length}</p>
            <p className="text-slate-400 text-sm mt-2">Actualmente online</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-300">Ubicaciones</h3>
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-4xl font-bold text-white">{new Set(devices.map(d => d.location)).size}</p>
            <p className="text-slate-400 text-sm mt-2">Distintas localidades</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-slate-300">Último Visto</h3>
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-xl font-bold text-white truncate">
              {devices.length > 0 ? formatRelativeTime(devices.sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen))[0].last_seen) : 'N/A'}
            </p>
            <p className="text-slate-400 text-sm mt-2">Actividad más reciente</p>
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
              className="block w-full pl-10 pr-3 py-3 border border-slate-600 bg-slate-700/50 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            />
          </div>
          
          <div className="flex space-x-4">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="online">En línea</option>
              <option value="offline">Sin conexión</option>
            </select>
            
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        
        {/* Lista de dispositivos */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-300 text-lg">Cargando dispositivos...</p>
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
                <div key={device.id} className="bg-slate-800/50 backdrop-blur rounded-xl overflow-hidden border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]">
                  <div className="p-6 relative">
                    {/* Indicador de estado */}
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
                    
                    {/* Cabecera del dispositivo */}
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-slate-600/50 mr-4">
                        {getDeviceIcon(device.device_type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{device.name}</h3>
                        <p className="text-slate-400 text-sm flex items-center">
                          <Globe className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          {device.ip}
                        </p>
                      </div>
                    </div>
                    
                    {/* Detalles del dispositivo */}
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
                          <p className="text-sm text-slate-300">{device.location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Cpu className="w-4 h-4 text-slate-400 mr-2" />
                        <div>
                          <p className="text-xs text-slate-500">Sistema</p>
                          <p className="text-sm text-slate-300">{device.os}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Wifi className="w-4 h-4 text-slate-400 mr-2" />
                        <div>
                          <p className="text-xs text-slate-500">Red</p>
                          <p className="text-sm text-slate-300">{device.network}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Estadísticas de rendimiento */}
                    {device.status === 'online' && (
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-slate-400">CPU</span>
                            <span className="text-xs text-slate-400">{device.cpu_usage}%</span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                            <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${device.cpu_usage}%` }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-slate-400">Memoria</span>
                            <span className="text-xs text-slate-400">{device.memory_usage}%</span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                            <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${device.memory_usage}%` }}></div>
                          </div>
                        </div>
                        
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
                      Registrado: {new Date(device.first_seen).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center">
                      <Monitor className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {device.resolution}
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
