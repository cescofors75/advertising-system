'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, AlertCircle, Info, Sun, Sunset, Moon } from 'lucide-react';

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

// Maximum ads per time slot
const MAX_ADS_PER_SLOT = 36;

export default function ScheduleForm({ initialSchedules = [], onChange, existingSchedulesCount = {} }) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState(null);
  const [timeSlotWarning, setTimeSlotWarning] = useState(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);

  // Actualizar schedules cuando initialSchedules cambie
  useEffect(() => {
    console.log('initialSchedules actualizados:', initialSchedules);
    setSchedules(initialSchedules || []);
  }, [initialSchedules]);

  // Determine which time slot a given hour falls into
  const getTimeSlotForHour = (hour) => {
    for (const [slotKey, slot] of Object.entries(TIME_SLOTS)) {
      if (hour >= slot.startHour && hour < slot.endHour) {
        return { key: slotKey, ...slot };
      }
    }
    return null;
  };

  // Get all time slots that a schedule falls into
  const getTimeSlotsForSchedule = (startDateTime, endDateTime) => {
    if (!startDateTime || !endDateTime) return [];
    
    const startDate = new Date(startDateTime);
    const endDate = new Date(endDateTime);
    const startHour = startDate.getHours();
    const endHour = endDate.getHours();
    
    const slots = new Set();
    
    // Check if the schedule crosses midnight
    if (startDate.getDate() !== endDate.getDate() || startHour > endHour) {
      // If schedule spans multiple days, add all time slots
      Object.keys(TIME_SLOTS).forEach(slotKey => {
        slots.add(slotKey);
      });
    } else {
      // Check which time slots this schedule falls into
      Object.keys(TIME_SLOTS).forEach(slotKey => {
        const slot = TIME_SLOTS[slotKey];
        
        // Check if any part of the schedule falls within this slot
        if ((startHour >= slot.startHour && startHour < slot.endHour) || 
            (endHour > slot.startHour && endHour <= slot.endHour) ||
            (startHour <= slot.startHour && endHour >= slot.endHour)) {
          slots.add(slotKey);
        }
      });
    }
    
    return Array.from(slots).map(slotKey => ({
      key: slotKey,
      ...TIME_SLOTS[slotKey]
    }));
  };

  // Update selected time slots based on current date/time inputs
  useEffect(() => {
    if (startDate && startTime && endDate && endTime) {
      try {
        const startDateTime = combineDateAndTime(startDate, startTime);
        const endDateTime = combineDateAndTime(endDate, endTime);
        
        if (startDateTime && endDateTime) {
          const slots = getTimeSlotsForSchedule(startDateTime, endDateTime);
          setSelectedTimeSlots(slots);
          
          // Set warning if schedule spans multiple time slots
          if (slots.length > 1) {
            setTimeSlotWarning(
              "Esta programación abarca múltiples franjas horarias. Cuando sea posible, intenta programar dentro de una sola franja."
            );
          } else {
            setTimeSlotWarning(null);
          }
        }
      } catch (err) {
        console.error("Error calculating time slots:", err);
      }
    } else {
      setSelectedTimeSlots([]);
      setTimeSlotWarning(null);
    }
  }, [startDate, startTime, endDate, endTime]);

  // Función auxiliar para combinar cadenas de fecha y hora en una sola cadena ISO
  const combineDateAndTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    
    try {
      const [year, month, day] = dateStr.split('-');
      const [hours, minutes] = timeStr.split(':');
      
      // Crear objeto de fecha y asegurar que sea válido
      const dateObj = new Date(year, month - 1, day, hours, minutes);
      
      if (isNaN(dateObj.getTime())) {
        console.error('Fecha inválida creada:', { dateStr, timeStr, dateObj });
        throw new Error('Fecha inválida');
      }
      
      console.log('Fecha y hora creada:', dateObj.toISOString());
      return dateObj.toISOString();
    } catch (error) {
      console.error('Error al crear fecha:', error, { dateStr, timeStr });
      throw new Error(`Formato de fecha inválido: ${dateStr} ${timeStr}`);
    }
  };

  const handleAddSchedule = () => {
    setError(null);
    console.log('Añadiendo programación con entradas:', { startDate, startTime, endDate, endTime });
    
    // Validar entradas
    if (!startDate || !startTime || !endDate || !endTime) {
      setError('Por favor complete todos los campos de programación');
      return;
    }
    
    let startDateTime, endDateTime;
    try {
      startDateTime = combineDateAndTime(startDate, startTime);
      endDateTime = combineDateAndTime(endDate, endTime);
      
      console.log('Objetos de fecha creados:', { startDateTime, endDateTime });
      
      // Validar que la hora de inicio sea anterior a la hora de fin
      if (new Date(startDateTime) >= new Date(endDateTime)) {
        setError('La hora de fin debe ser posterior a la hora de inicio');
        return;
      }
    } catch (err) {
      setError(err.message || 'Error al crear objetos de fecha');
      console.error('Error en el procesamiento de fecha:', err);
      return;
    }
    
    // Crear una nueva programación
    const newSchedule = {
      id: Date.now(), // ID temporal para la UI
      start_time: startDateTime,
      end_time: endDateTime
    };
    
    // Añadir al array de programaciones
    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    
    // Llamar al callback onChange del padre
    if (onChange) {
      onChange(updatedSchedules);
    }
    
    // Reiniciar formulario
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
  };

  const handleRemoveSchedule = (scheduleId) => {
    const updatedSchedules = schedules.filter(schedule => 
      schedule.id !== scheduleId
    );
    
    setSchedules(updatedSchedules);
    
    // Llamar al callback onChange del padre
    if (onChange) {
      onChange(updatedSchedules);
    }
  };

  // Formatear fecha para mostrar
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get time slots for a schedule
  const getScheduleTimeSlots = (schedule) => {
    return getTimeSlotsForSchedule(schedule.start_time, schedule.end_time);
  };

  // Render a badge for each time slot
  const renderTimeSlotBadges = (slots) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          <Calendar className="inline w-5 h-5 mr-2 text-blue-400" />
          Programación Temporal
        </h3>
        <p className="text-sm text-slate-400">
          Define cuándo se mostrará este anuncio
        </p>
      </div>
      
      {/* Time Slot Guide */}
      <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
        <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center">
          <Info className="w-4 h-4 mr-2 text-blue-400" />
          Guía de Franjas Horarias
        </h4>
        <p className="text-xs text-slate-400 mb-3">
          Los anuncios se organizan en tres franjas. Cada franja permite hasta {MAX_ADS_PER_SLOT} anuncios simultáneos.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {Object.entries(TIME_SLOTS).map(([key, slot]) => {
            const Icon = slot.icon;
            return (
              <div 
                key={key} 
                className="flex items-center px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-600/50"
              >
                <Icon className="w-4 h-4 mr-2 text-slate-400" />
                <span className="text-xs">
                  <span className="font-medium text-slate-300">{slot.name}:</span>
                  <span className="text-slate-400 ml-1">{slot.startHour}:00 - {slot.endHour}:00</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Lista de Programaciones */}
      {schedules.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-3">Programaciones actuales:</h4>
          <div className="space-y-2">
            {schedules.map((schedule) => (
              <div 
                key={schedule.id} 
                className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-slate-300 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-slate-400" />
                    {formatDateTime(schedule.start_time)} → {formatDateTime(schedule.end_time)}
                  </span>
                  <div className="mt-2">
                    {renderTimeSlotBadges(getScheduleTimeSlots(schedule))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSchedule(schedule.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all ml-4"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Formulario para Añadir Nueva Programación */}
      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
        <h4 className="text-sm font-medium text-slate-300 mb-4">Añadir Nueva Programación</h4>
        
        {/* Selected Time Slots Preview */}
        {selectedTimeSlots.length > 0 && (
          <div className="mb-4 bg-slate-800/50 rounded-lg p-3 border border-slate-600/50">
            <p className="text-xs text-slate-400 mb-2">Esta programación afectará a las franjas:</p>
            <div className="flex flex-wrap gap-2">
              {renderTimeSlotBadges(selectedTimeSlots)}
            </div>
            
            {timeSlotWarning && (
              <div className="mt-3 flex items-start">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-xs text-amber-400">
                  {timeSlotWarning}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Fecha de inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Hora de inicio
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Fecha de fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Hora de fin
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <button
          type="button"
          onClick={handleAddSchedule}
          className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white rounded-lg font-medium transition-all flex items-center justify-center transform hover:scale-105 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir Programación
        </button>
      </div>
    </div>
  );
}