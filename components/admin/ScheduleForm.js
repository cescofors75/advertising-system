'use client';

import { useState, useEffect } from 'react';

// Time slot definitions (same as in TimeSlotTabs.js)
const TIME_SLOTS = {
  morning: { name: 'Day', startHour: 0, endHour: 8, color: 'blue' },
  afternoon: { name: 'Afternoon', startHour: 8, endHour: 16, color: 'green' },
  night: { name: 'Night', startHour: 16, endHour: 24, color: 'purple' }
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
              "This schedule spans multiple time slots. When possible, try to schedule within a single time slot."
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
    return date.toLocaleString();
  };

  // Get time slots for a schedule
  const getScheduleTimeSlots = (schedule) => {
    return getTimeSlotsForSchedule(schedule.start_time, schedule.end_time);
  };

  // Render a badge for each time slot
  const renderTimeSlotBadges = (slots) => {
    return slots.map(slot => (
      <span 
        key={slot.key} 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 bg-${slot.color}-100 text-${slot.color}-800`}
      >
        {slot.name}
      </span>
    ));
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Programación</h3>
      
      {/* Time Slot Guide */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
        <h4 className="text-sm font-medium text-black mb-2">Guía de Franjas Horarias</h4>
        <p className="text-xs text-black mb-3">
          Los anuncios se organizan en tres franjas horarias. Intenta programar dentro de una única franja cuando sea posible.
          Cada franja tiene un límite de 36 anuncios (12 por minuto durante 8 horas).
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TIME_SLOTS).map(([key, slot]) => (
            <div 
              key={key} 
              className={`flex items-center px-3 py-1 rounded-md bg-${slot.color}-50 border border-${slot.color}-200`}
            >
              <span className={`w-3 h-3 rounded-full bg-${slot.color}-500 mr-2`}></span>
              <span className="text-xs font-medium">{slot.name}: {slot.startHour}:00 - {slot.endHour}:00</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Lista de Programaciones */}
      {schedules.length > 0 ? (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-black mb-2">Programaciones actuales:</h4>
          <ul className="bg-white rounded-md p-2">
            {schedules.map((schedule) => (
              <li 
                key={schedule.id} 
                className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-black">
                    {formatDateTime(schedule.start_time)} hasta {formatDateTime(schedule.end_time)}
                  </span>
                  <div className="mt-1">
                    {renderTimeSlotBadges(getScheduleTimeSlots(schedule))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSchedule(schedule.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-black mb-4">No hay programaciones establecidas. Añade una a continuación.</p>
      )}
      
      {/* Formulario para Añadir Nueva Programación */}
      <div className="border p-4 rounded-md bg-gray-50">
        <h4 className="text-sm font-medium text-black mb-3">Añadir Nueva Programación</h4>
        
        {/* Selected Time Slots */}
        {selectedTimeSlots.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-black mb-2">Esta programación caerá en las siguientes franjas:</p>
            <div className="flex flex-wrap gap-2">
              {renderTimeSlotBadges(selectedTimeSlots)}
            </div>
            
            {timeSlotWarning && (
              <p className="mt-2 text-xs text-orange-600">
                {timeSlotWarning}
              </p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-black mb-1">
              Fecha de inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-black"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-black mb-1">
              Hora de inicio
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-black"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-black mb-1">
              Fecha de fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-black"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-black mb-1">
              Hora de fin
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-black"
            />
          </div>
        </div>
        
        {error && (
          <div className="mb-3">
            <p className="text-black text-xs">{error}</p>
          </div>
        )}
        
        <div>
          <button
            type="button"
            onClick={handleAddSchedule}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm"
          >
            Añadir Programación
          </button>
        </div>
      </div>
    </div>
  );
}

