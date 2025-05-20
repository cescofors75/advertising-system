'use client';

import { useState, useEffect } from 'react';

export default function ScheduleForm({ initialSchedules = [], onChange }) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState(null);

  // Actualizar schedules cuando initialSchedules cambie
  useEffect(() => {
    console.log('initialSchedules actualizados:', initialSchedules);
    setSchedules(initialSchedules || []);
  }, [initialSchedules]);

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

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Programación</h3>
      
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
                <span className="text-sm text-black">
                  {formatDateTime(schedule.start_time)} hasta {formatDateTime(schedule.end_time)}
                </span>
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

