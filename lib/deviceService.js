// lib/deviceService.js - Uses API routes instead of Supabase

class DeviceService {
  // Update interval in seconds
  UPDATE_INTERVAL_SECONDS = 30;

  /**
   * Get count of online/connected devices
   * @returns {Promise<number>} Number of online devices
   */
  async getOnlineDevicesCount() {
    try {
      const res = await fetch('/api/devices?countOnly=true');
      if (!res.ok) return 0;
      const data = await res.json();
      return data.online || 0;
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
      const res = await fetch('/api/devices?status=online');
      if (!res.ok) return [];
      return await res.json();
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
      const res = await fetch(`/api/devices/${deviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: isOnline ? 'online' : 'offline',
          last_seen: new Date().toISOString(),
        }),
      });
      return res.ok;
    } catch (err) {
      console.error('Error in updateDeviceStatus:', err);
      return false;
    }
  }
}

// Export a singleton instance
const deviceService = new DeviceService();
export default deviceService;