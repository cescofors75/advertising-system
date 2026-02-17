'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Eye, Edit, Trash2, Image, Video, Sun, Sunset, Moon, Clock, Globe, QrCode, Film } from 'lucide-react';

// Time slot definitions
const TIME_SLOTS = {
  morning: { 
    name: 'Día', 
    startHour: 0, 
    endHour: 8, 
    color: 'blue',
    icon: Sun,
    gradient: 'from-blue-400 to-blue-600'
  },
  afternoon: { 
    name: 'Tarde', 
    startHour: 8, 
    endHour: 16, 
    color: 'green',
    icon: Sunset,
    gradient: 'from-emerald-400 to-green-600'
  },
  night: { 
    name: 'Noche', 
    startHour: 16, 
    endHour: 24, 
    color: 'purple',
    icon: Moon,
    gradient: 'from-purple-400 to-purple-600'
  }
};

export default function AdList({ advertisements, onEdit, onDelete, onPreview }) {
  // Component to show video duration and number of tramos
  const VideoDurationBadge = ({ mediaUrl }) => {
    const [duration, setDuration] = useState(null);
    const videoRef = useRef(null);

    useEffect(() => {
      if (!mediaUrl) return;
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = mediaUrl;
      video.onloadedmetadata = () => {
        if (video.duration && isFinite(video.duration)) {
          setDuration(video.duration);
        }
      };
      video.onerror = () => setDuration(null);
      videoRef.current = video;
      return () => {
        if (videoRef.current) {
          videoRef.current.src = '';
          videoRef.current = null;
        }
      };
    }, [mediaUrl]);

    if (duration === null) return null;

    const SLOT_DURATION = 7; // seconds per normal ad slot
    const tramos = Math.ceil(duration / SLOT_DURATION);
    const minutes = Math.floor(duration / 60);
    const seconds = Math.round(duration % 60);
    const durationStr = minutes > 0 
      ? `${minutes}m ${seconds.toString().padStart(2, '0')}s` 
      : `${seconds}s`;

    return (
      <div className="mt-1.5 space-y-1">
        <div className="flex items-center text-xs text-slate-400">
          <Film className="w-3 h-3 mr-1 text-blue-400" />
          <span>Duración: <span className="text-white font-medium">{durationStr}</span></span>
        </div>
        <div className="flex items-center text-xs">
          <Clock className="w-3 h-3 mr-1 text-orange-400" />
          <span className="text-slate-400">
            Ocupa <span className={`font-bold ${tramos > 1 ? 'text-orange-400' : 'text-emerald-400'}`}>{tramos}</span> {tramos === 1 ? 'tramo' : 'tramos'} de {SLOT_DURATION}s
          </span>
        </div>
      </div>
    );
  };

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
    
    return slots.map(slot => {
      const Icon = slot.icon;
      return (
        <span 
          key={slot.key} 
          className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-gradient-to-r ${slot.gradient} text-white mr-1`}
        >
          <Icon className="w-3 h-3 mr-1" />
          {slot.name}
        </span>
      );
    });
  };

  if (!advertisements || advertisements.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-12 text-center border border-slate-700/50">
        <div className="text-slate-400 mb-4">
          <Clock className="w-16 h-16 mx-auto opacity-50" />
        </div>
        <p className="text-slate-400 text-lg">No se encontraron anuncios. ¡Crea tu primer anuncio!</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-2xl overflow-hidden border border-slate-700/50">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-700/50">
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Título
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Media
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Características
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Franjas
              </th>
              <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {advertisements.map((ad, index) => (
              <tr 
                key={ad.id} 
                className="hover:bg-slate-700/30 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-white">{ad.title}</div>
                    {ad.description && (
                      <div className="text-sm text-slate-400 truncate max-w-xs mt-1">
                        {ad.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {ad.media_url ? (
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        {ad.media_type === 'video' ? (
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-slate-600/50">
                            <Video className="w-6 h-6 text-blue-400" />
                          </div>
                        ) : (
                          <div className="relative group">
                            <img 
                              className="h-12 w-12 rounded-lg object-cover border border-slate-600/50" 
                              src={ad.media_url} 
                              alt="" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm text-slate-300 capitalize flex items-center">
                          {ad.media_type === 'video' ? (
                            <Video className="w-4 h-4 mr-1 text-blue-400" />
                          ) : (
                            <img className="w-4 h-4 mr-1 text-emerald-400" />
                          )}
                          {ad.media_type}
                        </div>
                        {ad.media_type === 'video' && (
                          <VideoDurationBadge mediaUrl={ad.media_url} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500 italic">Sin multimedia</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    ad.active 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${ad.active ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                    {ad.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {ad.website_url && (
                      <div className="flex items-center text-slate-400" title="Tiene URL">
                        <Globe className="w-4 h-4" />
                      </div>
                    )}
                    {ad.show_qr_code && (
                      <div className="flex items-center text-slate-400" title="Muestra código QR">
                        <QrCode className="w-4 h-4" />
                      </div>
                    )}
                    {!ad.website_url && !ad.show_qr_code && (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {ad.time_slot_morning || ad.time_slot_afternoon || ad.time_slot_night ? (
                    <div className="flex flex-wrap gap-1">
                      {renderTimeSlotBadges(ad)}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs text-slate-500 bg-slate-700/50">
                      <Clock className="w-3 h-3 mr-1" />
                      Sin franjas
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={() => onPreview(ad)}
                      className="p-2 bg-slate-700/50 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-lg transition-all group"
                      title="Vista previa"
                    >
                      <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => onEdit(ad)}
                      className="p-2 bg-slate-700/50 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-lg transition-all group"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => onDelete(ad.id)}
                      className="p-2 bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all group"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}