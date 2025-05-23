'use client';

import React from 'react';

// Time slot definitions
const TIME_SLOTS = {
  morning: { name: 'Día', startHour: 0, endHour: 8, color: 'blue' },
  afternoon: { name: 'Tarde', startHour: 8, endHour: 16, color: 'green' },
  night: { name: 'Noche', startHour: 16, endHour: 24, color: 'purple' }
};

export default function AdList({ advertisements, onEdit, onDelete, onPreview }) {
  // Render time slot badges for an ad
  const renderTimeSlotBadges = (ad) => {
    const slots = [];
    
    if (ad.time_slot_morning) {
      slots.push({
        key: 'morning',
        ...TIME_SLOTS.morning
      });
    }
    
    if (ad.time_slot_afternoon) {
      slots.push({
        key: 'afternoon',
        ...TIME_SLOTS.afternoon
      });
    }
    
    if (ad.time_slot_night) {
      slots.push({
        key: 'night',
        ...TIME_SLOTS.night
      });
    }
    
    return slots.map(slot => (
      <span 
        key={slot.key} 
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-1 bg-${slot.color}-100 text-${slot.color}-800`}
      >
        {slot.name}
      </span>
    ));
  };

  if (!advertisements || advertisements.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-black text-center">No se encontraron anuncios. ¡Crea tu primer anuncio!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Título
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Media
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Franjas
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {advertisements.map((ad) => (
            <tr key={ad.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-black">{ad.title}</div>
                <div className="text-sm text-black truncate max-w-xs">{ad.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {ad.media_url ? (
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {ad.media_type === 'video' ? (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-black">
                          <span>🎬</span>
                        </div>
                      ) : (
                        <img 
                          className="h-10 w-10 rounded object-cover" 
                          src={ad.media_url} 
                          alt="" 
                        />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm text-black">{ad.media_type}</div>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-black">Sin multimedia</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  ad.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {ad.active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                {ad.time_slot_morning || ad.time_slot_afternoon || ad.time_slot_night ? (
                  <div className="flex flex-wrap gap-1">
                    {renderTimeSlotBadges(ad)}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">Sin franjas</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onPreview(ad)}
                    className="text-indigo-500 hover:text-indigo-900"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => onEdit(ad)}
                    className="text-blue-500 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(ad.id)}
                    className="text-red-500 hover:text-red-900"
                  >
                    Borrar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
