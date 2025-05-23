'use client';

import { useState, useEffect } from 'react';

// Time slot definitions
const TIME_SLOTS = {
  morning: { name: 'Día', startHour: 0, endHour: 8, color: 'blue' },
  afternoon: { name: 'Tarde', startHour: 8, endHour: 16, color: 'green' },
  night: { name: 'Noche', startHour: 16, endHour: 24, color: 'purple' }
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
    <div className="mb-4">
      {/* Search bar */}
      <div className="mb-4">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-10 py-2 border-gray-300 rounded-md"
            placeholder="Buscar anuncios por título o descripción..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                aria-label="Limpiar búsqueda"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
        {searchQuery && (
          <p className="mt-1 text-sm text-gray-500">
            Mostrando {filteredAds.length} resultado{filteredAds.length !== 1 ? 's' : ''} para &quot;{searchQuery}&quot;
          </p>
        )}
      </div>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap" role="tablist">
          {/* Regular time slot tabs */}
          {Object.keys(TIME_SLOTS).map(slotKey => {
            const slot = TIME_SLOTS[slotKey];
            const isActive = activeTab === slotKey;
            const count = slotCounts[slotKey] || 0;
            const isOverLimit = count > MAX_ADS_PER_SLOT;
            
            return (
              <button
                key={slotKey}
                onClick={() => handleTabChange(slotKey)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${slotKey}-panel`}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } relative`}
              >
                {slot.name} ({slot.startHour}:00 - {slot.endHour}:00)
                
                {/* Badge showing the count */}
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isOverLimit ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
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
            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'unassigned'
                ? 'border-yellow-500 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Sin Asignar
            
            {/* Badge showing the count */}
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {slotCounts.unassigned || 0}
            </span>
          </button>
        </nav>
      </div>
      
      {/* Warning message if exceeding the limit */}
      {activeTab !== 'unassigned' && (slotCounts[activeTab] || 0) > MAX_ADS_PER_SLOT && (
        <div className="mt-4 p-4 border-l-4 border-red-500 bg-red-50 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Límite de anuncios excedido
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Esta franja horaria ha excedido el límite máximo de {MAX_ADS_PER_SLOT} anuncios. 
                Por favor, elimine algunos anuncios o reprograme algunos a una franja horaria diferente.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Message for the unassigned tab */}
      {activeTab === 'unassigned' && (
        <div className="mt-4 p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Anuncios sin asignar
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
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
        className="mt-4"
      >
        {showNoAdsMessage ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            {searchQuery ? (
              <p className="text-gray-600">No se encontraron anuncios que coincidan con &ldquo;{searchQuery}&rdquo;</p>
            ) : (
              <p className="text-gray-600">No hay anuncios en esta franja horaria</p>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-600 mb-2">
            Mostrando {filteredAds.length} anuncio{filteredAds.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
