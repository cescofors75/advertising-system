'use client';

import { useState, useEffect } from 'react';
import { Sun, Sunset, Moon, Clock, Search, X, AlertTriangle, Info } from 'lucide-react';

// Time slot definitions
const TIME_SLOTS = {
  morning: { 
    name: 'Día', 
    startHour: 0, 
    endHour: 8, 
    color: 'blue',
    icon: Sun,
    gradient: 'from-blue-400 to-blue-600',
    bgGradient: 'from-blue-500/20 to-blue-600/20'
  },
  afternoon: { 
    name: 'Tarde', 
    startHour: 8, 
    endHour: 16, 
    color: 'green',
    icon: Sunset,
    gradient: 'from-emerald-400 to-green-600',
    bgGradient: 'from-emerald-500/20 to-green-600/20'
  },
  night: { 
    name: 'Noche', 
    startHour: 16, 
    endHour: 24, 
    color: 'purple',
    icon: Moon,
    gradient: 'from-purple-400 to-purple-600',
    bgGradient: 'from-purple-500/20 to-purple-600/20'
  }
};

// Maximum ads per time slot
const MAX_ADS_PER_SLOT = 36;

export default function TimeSlotTabs({ advertisements = [], onSelectedAdsChange }) {
  const [activeTab, setActiveTab] = useState('morning');
  const [filteredAds, setFilteredAds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [slotCounts, setSlotCounts] = useState({
    morning: 0,
    afternoon: 0,
    night: 0,
    unassigned: 0
  });
  const [showNoAdsMessage, setShowNoAdsMessage] = useState(false);

  // Filter ads based on the active tab and search query
  useEffect(() => {
    console.log(`Filtering ads for ${activeTab} tab. Total ads: ${advertisements.length}`);
    
    // Process all advertisements and count them by time slot
    const morning = advertisements.filter(ad => ad.time_slot_morning).length;
    const afternoon = advertisements.filter(ad => ad.time_slot_afternoon).length;
    const night = advertisements.filter(ad => ad.time_slot_night).length;
    const unassigned = advertisements.filter(ad => 
      !ad.time_slot_morning && !ad.time_slot_afternoon && !ad.time_slot_night
    ).length;
    
    // Update counts
    const counts = { morning, afternoon, night, unassigned };
    console.log("Ad counts per time slot:", counts);
    setSlotCounts(counts);

    // Filter ads for the active tab
    let filtered;
    
    if (activeTab === 'unassigned') {
      // For the unassigned tab, show only ads with no time slots
      filtered = advertisements.filter(ad => 
        !ad.time_slot_morning && !ad.time_slot_afternoon && !ad.time_slot_night
      );
      console.log(`Found ${filtered.length} unassigned ads`);
    } else if (activeTab === 'morning') {
      filtered = advertisements.filter(ad => ad.time_slot_morning);
      console.log(`Found ${filtered.length} morning ads`);
    } else if (activeTab === 'afternoon') {
      filtered = advertisements.filter(ad => ad.time_slot_afternoon);
      console.log(`Found ${filtered.length} afternoon ads`);
    } else if (activeTab === 'night') {
      filtered = advertisements.filter(ad => ad.time_slot_night);
      console.log(`Found ${filtered.length} night ads`);
    }
    
    // Apply search filter
    const searchFiltered = applySearchFilter(filtered);
    if (searchQuery.trim()) {
      console.log(`Search query "${searchQuery}" filtered results from ${filtered.length} to ${searchFiltered.length} ads`);
    }
    
    console.log(`Final count: ${searchFiltered.length} ads for ${activeTab} tab after search filtering`);
    setFilteredAds(searchFiltered);
    
    // Set flag to show "No ads" message if there are no ads in this tab
    setShowNoAdsMessage(searchFiltered.length === 0);
    
    // Notify parent component of the filtered ads
    if (onSelectedAdsChange) {
      onSelectedAdsChange(searchFiltered);
    }
  }, [advertisements, activeTab, searchQuery]);
  
  // Apply search filter to advertisements
  const applySearchFilter = (ads) => {
    if (!searchQuery.trim()) return ads;
    
    const query = searchQuery.toLowerCase().trim();
    return ads.filter(ad => {
      const titleMatch = ad.title?.toLowerCase().includes(query);
      const descMatch = ad.description?.toLowerCase().includes(query);
      return titleMatch || descMatch;
    });
  };
  
  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Handle tab change
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  return (
    <div className="mb-8">
      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-12 pr-12 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Buscar anuncios por título o descripción..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <button
                type="button"
                onClick={clearSearch}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700/50 rounded-lg"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-slate-400">
            Mostrando {filteredAds.length} resultado{filteredAds.length !== 1 ? 's' : ''} para &quot;{searchQuery}&quot;
          </p>
        )}
      </div>
      
      {/* Tab navigation */}
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-2 border border-slate-700/50">
        <nav className="flex flex-wrap gap-2" role="tablist">
          {/* Regular time slot tabs */}
          {Object.keys(TIME_SLOTS).map(slotKey => {
            const slot = TIME_SLOTS[slotKey];
            const isActive = activeTab === slotKey;
            const count = slotCounts[slotKey] || 0;
            const isOverLimit = count > MAX_ADS_PER_SLOT;
            const Icon = slot.icon;
            
            return (
              <button
                key={slotKey}
                onClick={() => handleTabChange(slotKey)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${slotKey}-panel`}
                className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all transform hover:scale-105 ${
                  isActive
                    ? `bg-gradient-to-r ${slot.gradient} text-white shadow-lg`
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                } relative`}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span>{slot.name}</span>
                <span className="ml-1 text-xs opacity-75">
                  ({slot.startHour}:00-{slot.endHour}:00)
                </span>
                
                {/* Badge showing the count */}
                <span className={`ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                  isOverLimit 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-600/50 text-slate-300'
                }`}>
                  {count}/{MAX_ADS_PER_SLOT}
                </span>
                
                {/* Warning if exceeding the limit */}
                {isOverLimit && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3" aria-hidden="true">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </button>
            );
          })}
          
          {/* Unassigned tab */}
          <button
            onClick={() => handleTabChange('unassigned')}
            role="tab"
            aria-selected={activeTab === 'unassigned'}
            aria-controls="unassigned-panel"
            className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all transform hover:scale-105 ${
              activeTab === 'unassigned'
                ? 'bg-gradient-to-r from-amber-400 to-orange-600 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Clock className="w-4 h-4 mr-2" />
            <span>Sin Asignar</span>
            
            {/* Badge showing the count */}
            <span className={`ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'unassigned'
                ? 'bg-white/20 text-white'
                : 'bg-slate-600/50 text-slate-300'
            }`}>
              {slotCounts.unassigned || 0}
            </span>
          </button>
        </nav>
      </div>
      
      {/* Warning message if exceeding the limit */}
      {activeTab !== 'unassigned' && (slotCounts[activeTab] || 0) > MAX_ADS_PER_SLOT && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-400">
                Límite de anuncios excedido
              </h3>
              <p className="mt-1 text-sm text-red-300">
                Esta franja horaria ha excedido el límite máximo de {MAX_ADS_PER_SLOT} anuncios. 
                Por favor, elimine algunos anuncios o reprograme algunos a una franja horaria diferente.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Message for the unassigned tab */}
      {activeTab === 'unassigned' && slotCounts.unassigned > 0 && (
        <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-400">
                Anuncios sin asignar
              </h3>
              <p className="mt-1 text-sm text-amber-300">
                Estos anuncios no tienen franjas horarias asignadas. Para asignar una franja horaria, 
                edite el anuncio y seleccione al menos una franja horaria.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Content panel */}
      <div 
        id={`${activeTab}-panel`} 
        role="tabpanel" 
        aria-labelledby={`${activeTab}-tab`}
        className="mt-6"
      >
        {showNoAdsMessage ? (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-12 text-center border border-slate-700/50">
            <div className="text-slate-400 mb-4">
              {activeTab === 'unassigned' ? (
                <Clock className="w-16 h-16 mx-auto opacity-50" />
              ) : (
                TIME_SLOTS[activeTab] && React.createElement(TIME_SLOTS[activeTab].icon, {
                  className: "w-16 h-16 mx-auto opacity-50"
                })
              )}
            </div>
            {searchQuery ? (
              <p className="text-slate-400">No se encontraron anuncios que coincidan con &quot;{searchQuery}&quot;</p>
            ) : (
              <p className="text-slate-400">No hay anuncios en esta franja horaria</p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
            <span>Mostrando {filteredAds.length} anuncio{filteredAds.length !== 1 ? 's' : ''}</span>
            {activeTab !== 'unassigned' && (
              <div className={`flex items-center px-3 py-1 rounded-lg bg-gradient-to-r ${TIME_SLOTS[activeTab]?.bgGradient || ''}`}>
                <span className="font-medium">
                  Ocupación: {((slotCounts[activeTab] / MAX_ADS_PER_SLOT) * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}