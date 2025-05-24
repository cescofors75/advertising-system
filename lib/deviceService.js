// lib/deviceService.js
import supabase from '@/lib/supabaseClient';

// Constantes compartidas
export const OFFLINE_THRESHOLD_MINUTES = 5;
export const UPDATE_INTERVAL_SECONDS = 10;

// Función para actualizar dispositivos offline
export async function updateOfflineDevices() {
  const thresholdTime = new Date(Date.now() - OFFLINE_THRESHOLD_MINUTES * 60 * 1000).toISOString();
  
  try {
    const { error } = await supabase
      .from('connected_devices')
      .update({ status: 'offline' })
      .eq('status', 'online')
      .lt('last_seen', thresholdTime);
      
    if (error) {
      console.error('Error updating offline devices:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error in updateOfflineDevices:', err);
    return false;
  }
}

// Función para obtener el conteo de dispositivos online
export async function getOnlineDevicesCount() {
  try {
    // Primero actualizar dispositivos offline
    await updateOfflineDevices();
    
    // Luego contar dispositivos online
    const { count, error } = await supabase
      .from('connected_devices')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'online');
      
    if (error) {
      console.error('Error counting online devices:', error);
      return 0;
    }
    
    return count || 0;
  } catch (err) {
    console.error('Error in getOnlineDevicesCount:', err);
    return 0;
  }
}

// Función para obtener todos los dispositivos
export async function getAllDevices() {
  try {
    // Primero actualizar dispositivos offline
    await updateOfflineDevices();
    
    // Obtener todos los dispositivos
    const { data, error } = await supabase
      .from('connected_devices')
      .select('*')
      .order('last_seen', { ascending: false });
      
    if (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Error in getAllDevices:', err);
    return [];
  }
}

// Función para obtener estadísticas
export function calculateDeviceStats(devices) {
  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const uniqueLocations = new Set(devices.filter(d => d.location).map(d => d.location)).size;
  
  return {
    totalDevices: devices.length,
    onlineDevices,
    uniqueLocations
  };
}

// Función para verificar si un dispositivo está realmente online
export function isDeviceOnline(lastSeenDate) {
  if (!lastSeenDate) return false;
  
  const lastSeen = new Date(lastSeenDate);
  const now = new Date();
  const diffMinutes = (now - lastSeen) / (1000 * 60);
  
  return diffMinutes < OFFLINE_THRESHOLD_MINUTES;
}