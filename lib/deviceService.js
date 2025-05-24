// lib/deviceService.js or services/deviceService.js
import supabase from "@/lib/supabaseClient";

class DeviceService {
  // Update interval in seconds
  UPDATE_INTERVAL_SECONDS = 30;

  /**
   * Get count of online/connected devices
   * @returns {Promise<number>} Number of online devices
   */
  async getOnlineDevicesCount() {
    try {
      const { count, error } = await supabase
        .from('connected_devices')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'online');

      if (error) {
        console.error('Error fetching online devices count:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('Error in getOnlineDevicesCount:', err);
      return 0;
    }
  }

  /**
   * Get all online devices with details
   * @returns {Promise<Array>} Array of online devices
   */
  async getOnlineDevices() {
    try {
      const { data, error } = await supabase
        .from('connected_devices')
        .select('*')
        .eq('status', 'online')
        .order('last_seen', { ascending: false });

      if (error) {
        console.error('Error fetching online devices:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in getOnlineDevices:', err);
      return [];
    }
  }

  /**
   * Update device status
   * @param {string} deviceId - Device ID
   * @param {boolean} isOnline - If true, status will be set to 'online', otherwise 'offline'
   * @returns {Promise<boolean>} Success status
   */
  async updateDeviceStatus(deviceId, isOnline) {
    try {
      const { error } = await supabase
        .from('connected_devices')
        .upsert({
          device_id: deviceId,
          status: isOnline ? 'online' : 'offline',
          last_seen: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating device status:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error in updateDeviceStatus:', err);
      return false;
    }
  }
}

// Export a singleton instance
const deviceService = new DeviceService();
export default deviceService;