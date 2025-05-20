'use client';

import React from 'react';

export default function AdList({ advertisements, onEdit, onDelete, onPreview }) {
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
              Title
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Media
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Schedule
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
                  ad.active ? 'bg-green-100 text-black' : 'bg-gray-100 text-black'
                }`}>
                  {ad.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                {console.log('Programaciones para el anuncio:', ad.title, ad.schedules)}
                {ad.schedules && ad.schedules.length > 0 ? (
                  <div>
                    {ad.schedules.map((schedule, index) => (
                      <div key={index} className="text-xs">
                        {new Date(schedule.start_time).toLocaleString()} - {new Date(schedule.end_time).toLocaleString()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>No schedule</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onPreview(ad)}
                    className="text-black hover:text-indigo-900"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => onEdit(ad)}
                    className="text-black hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(ad.id)}
                    className="text-black hover:text-red-900"
                  >
                    Delete
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

