'use client';

import { useState } from 'react';

export default function ScheduleForm({ initialSchedules = [], onChange }) {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState(null);

  // Helper function to combine date and time strings into a single ISO string
  const combineDateAndTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;
    const [year, month, day] = dateStr.split('-');
    const [hours, minutes] = timeStr.split(':');
    return new Date(year, month - 1, day, hours, minutes).toISOString();
  };

  const handleAddSchedule = () => {
    setError(null);
    
    // Validate inputs
    if (!startDate || !startTime || !endDate || !endTime) {
      setError('Please fill in all schedule fields');
      return;
    }
    
    const startDateTime = combineDateAndTime(startDate, startTime);
    const endDateTime = combineDateAndTime(endDate, endTime);
    
    // Validate start time is before end time
    if (new Date(startDateTime) >= new Date(endDateTime)) {
      setError('End time must be after start time');
      return;
    }
    
    // Create a new schedule
    const newSchedule = {
      id: Date.now(), // Temporary ID for the UI
      start_time: startDateTime,
      end_time: endDateTime
    };
    
    // Add to schedules array
    const updatedSchedules = [...schedules, newSchedule];
    setSchedules(updatedSchedules);
    
    // Call parent's onChange callback
    if (onChange) {
      onChange(updatedSchedules);
    }
    
    // Reset form
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
    
    // Call parent's onChange callback
    if (onChange) {
      onChange(updatedSchedules);
    }
  };

  // Format date for display
  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Schedule</h3>
      
      {/* Schedule List */}
      {schedules.length > 0 ? (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Current Schedules:</h4>
          <ul className="bg-gray-50 rounded-md p-2">
            {schedules.map((schedule) => (
              <li 
                key={schedule.id} 
                className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
              >
                <span className="text-sm">
                  {formatDateTime(schedule.start_time)} to {formatDateTime(schedule.end_time)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSchedule(schedule.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">No schedules set. Add one below.</p>
      )}
      
      {/* Add New Schedule Form */}
      <div className="border p-4 rounded-md bg-gray-50">
        <h4 className="text-sm font-medium mb-3">Add New Schedule</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        {error && (
          <div className="mb-3">
            <p className="text-red-500 text-xs">{error}</p>
          </div>
        )}
        
        <div>
          <button
            type="button"
            onClick={handleAddSchedule}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm"
          >
            Add Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

