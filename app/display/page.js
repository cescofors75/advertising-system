"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { generatePaymentUrl, getPromotionalMessage } from "@/lib/paymentUtils";


// Initialize i18next


// Brand colors
const ORANGE = "#ff8000";
const GRADIENT =
  "linear-gradient(135deg, #ff8000 0%, #ff6b00 50%, #e55a00 100%)";
const DARK_GRADIENT =
  "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #404040 100%)";

// Custom CSS animations for professional transitions
const customStyles = `
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(60px) scale(0.97); filter: blur(8px); }
    to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
  }
  @keyframes slideOutLeft {
    from { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
    to { opacity: 0; transform: translateX(-60px) scale(0.97); filter: blur(8px); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-60px) scale(0.97); filter: blur(8px); }
    to { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
  }
  @keyframes slideOutRight {
    from { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
    to { opacity: 0; transform: translateX(60px) scale(0.97); filter: blur(8px); }
  }
  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.92); filter: blur(6px); }
    to { opacity: 1; transform: scale(1); filter: blur(0); }
  }
  @keyframes fadeOutScale {
    from { opacity: 1; transform: scale(1); filter: blur(0); }
    to { opacity: 0; transform: scale(1.03); filter: blur(6px); }
  }
  @keyframes floatQR {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 15px rgba(255,128,0,0.3), 0 0 30px rgba(255,128,0,0.1); }
    50% { box-shadow: 0 0 25px rgba(255,128,0,0.5), 0 0 50px rgba(255,128,0,0.2); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes borderRotate {
    0% { border-color: rgba(255,255,255,0.3); }
    50% { border-color: rgba(255,255,255,0.6); }
    100% { border-color: rgba(255,255,255,0.3); }
  }
  .slide-in-right { animation: slideInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .slide-out-left { animation: slideOutLeft 0.5s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
  .slide-in-left { animation: slideInLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .slide-out-right { animation: slideOutRight 0.5s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
  .fade-in-scale { animation: fadeInScale 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .fade-out-scale { animation: fadeOutScale 0.5s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
  .float-qr { animation: floatQR 3s ease-in-out infinite; }
  .glow-pulse { animation: glowPulse 2.5s ease-in-out infinite; }
  .shimmer-text {
    background: linear-gradient(90deg, #fff 0%, #ffe0b2 40%, #fff 60%, #ffe0b2 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
  }
`;

// Professional VisitToo Sidebar Component
const VisitTooSidebar = () => (
  <div 
    className="w-[20%] h-full relative overflow-hidden flex flex-col items-center justify-center"
    style={{ background: 'linear-gradient(180deg, #ff8c00 0%, #ff6b00 40%, #e55a00 70%, #cc4e00 100%)' }}
  >
    {/* Subtle pattern overlay */}
    <div className="absolute inset-0 opacity-[0.07]">
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />
    </div>

    {/* Top accent line */}
    <div className="absolute top-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

    {/* Content */}
    <div className="relative z-10 flex flex-col items-center justify-center px-6 space-y-8">
      {/* Logo VisitToo with glow */}
      <div className="relative">
        <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl scale-150" />
        <img
          src="https://www.visittoo.com/img/master/logo_visitToo_white.png"
          alt="VisitToo"
          width={144}
          height={144}
          className="w-36 h-auto relative z-10 drop-shadow-lg"
        />
      </div>

      {/* Decorative separator */}
      <div className="flex items-center w-full max-w-[140px]">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/40" />
        <div className="mx-3">
          <div className="w-2 h-2 bg-white/60 rounded-full" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/40" />
      </div>

      {/* Text "Para más información" */}
      <div className="text-center">
        <p className="text-white/90 text-base font-light tracking-wide uppercase" style={{ letterSpacing: '0.15em' }}>
          Para más información
        </p>
      </div>

      {/* QR Code with professional frame */}
      <div className="float-qr">
        <div className="relative glow-pulse rounded-2xl">
          {/* Corner accents */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white/50 rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white/50 rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white/50 rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white/50 rounded-br-lg" />
          
          <div className="bg-white p-4 rounded-2xl shadow-2xl">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://visittoo.com&margin=1"
              alt="QR Code VisitToo"
              width={144}
              height={144}
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Text "Escanéame" with shimmer */}
      <div className="text-center">
        <p className="shimmer-text text-2xl font-bold tracking-wider">
          Escanéame
        </p>
        <div className="mt-2 flex items-center justify-center space-x-1">
          <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
          <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    </div>

    {/* Bottom accent line */}
    <div className="absolute bottom-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
  </div>
);

// Time slot definitions

const TIME_SLOTS = {
  morning: { name: "Mañana", startHour: 0, endHour: 8, color: "blue" },
  afternoon: { name: "Tarde", startHour: 8, endHour: 16, color: "green" },
  night: { name: "Noche", startHour: 16, endHour: 24, color: "purple" },
}; 

export default function DisplayPage() {
  const [allAds, setAllAds] = useState([]);
  const [filteredAds, setFilteredAds] = useState([]);
  const [currentAdIndexIndex, setcurrentAdIndexIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fadeState, setFadeState] = useState("in");
  const [currentTimeSlot, setCurrentTimeSlot] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [slideDirection, setSlideDirection] = useState("next");
  const [backgroundPattern, setBackgroundPattern] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState("connected");
  const [realtimeNotification, setRealtimeNotification] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [showWeather, setShowWeather] = useState(false);
  const [weatherSlide, setWeatherSlide] = useState('current'); // 'current' or 'forecast'
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [reconnectCount, setReconnectCount] = useState(0);
  const currentAdIndexRef = useRef(0);
  const filteredAdsRef = useRef([]);
  const currentTimeSlotRef = useRef("");
  const heartbeatIntervalRef = useRef(null);
  const [currentVideoDuration, setCurrentVideoDuration] = useState(0); // duration in seconds for the currently displayed video
  

  // Time slot definitions with translations

  // First, add this new state variable to your existing state declarations
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    currentAdIndexRef.current = currentAdIndexIndex;
    filteredAdsRef.current = filteredAds;
    currentTimeSlotRef.current = currentTimeSlot;
  }, [currentAdIndexIndex, filteredAds, currentTimeSlot]);

  // Add this useEffect hook to collect and send device data
  useEffect(() => {
    let heartbeatInterval = null;
    let deviceId = "";
    
    // Function to get device information and send it
    const collectAndSendDeviceData = async () => {
      // Generate a unique device ID if none exists
      let deviceIdentifier = localStorage.getItem("device_id");
      if (!deviceIdentifier) {
        deviceIdentifier =
          "device_" +
          Date.now() +
          "_" +
          Math.random().toString(36).substr(2, 9);
        localStorage.setItem("device_id", deviceIdentifier);
      }
      deviceId = deviceIdentifier;
      setDeviceId(deviceIdentifier);

      // Get current ad details from latest refs
      const currentAds = filteredAdsRef.current || [];
      const currentIndex = currentAdIndexRef.current ?? 0;
      const currentAd =
        currentIndex >= 0 &&
        currentAds.length > 0 &&
        currentAds[currentIndex]
          ? currentAds[currentIndex]
          : null;

      // Collect device information
      const deviceInfo = {
        id: deviceIdentifier,
        name: deviceIdentifier,
        ip: "",
        os: getOperatingSystem(),
        browser: getBrowserInfo(),
        device_type: getDeviceType(),
        location: "",
        status: "online",
        network: navigator.connection
          ? navigator.connection.effectiveType
          : "unknown",
        resolution: `${window.screen.width}x${window.screen.height}`,
        user_agent: navigator.userAgent,
        battery: await getBatteryLevel(),
        current_ad: currentAd ? currentAd.title : null,
        current_time_slot: currentTimeSlotRef.current,
      };

      // Send to API
      try {
        await fetch('/api/devices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(deviceInfo),
        });
        console.log("✅ Device info updated successfully");

        // If there's a current ad, log the view
        if (currentAd) {
          const adViewKey = `ad_view_${currentAd.id}_${currentAdIndexIndex}`;
          if (!localStorage.getItem(adViewKey)) {
            await fetch('/api/ad-views', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                device_id: deviceIdentifier,
                ad_id: currentAd.id,
                time_slot: currentTimeSlotRef.current,
              }),
            });
            localStorage.setItem(adViewKey, "viewed");
            console.log("✅ Ad view logged successfully");
          }
        }
      } catch (error) {
        console.error("❌ Error updating device info:", error);
      }

      return deviceIdentifier;
    };

    // Helper functions to get device information
    const getOperatingSystem = () => {
      const userAgent = window.navigator.userAgent;
      if (userAgent.indexOf("Windows") !== -1) return "Windows";
      if (userAgent.indexOf("Mac") !== -1) return "macOS";
      if (userAgent.indexOf("Linux") !== -1) return "Linux";
      if (userAgent.indexOf("Android") !== -1) return "Android";
      if (userAgent.indexOf("iOS") !== -1 || userAgent.indexOf("iPhone") !== -1 || userAgent.indexOf("iPad") !== -1) return "iOS";
      return "Unknown OS";
    };

    const getBrowserInfo = () => {
      const userAgent = window.navigator.userAgent;
      if (userAgent.indexOf("Chrome") !== -1) return "Chrome";
      if (userAgent.indexOf("Firefox") !== -1) return "Firefox";
      if (userAgent.indexOf("Safari") !== -1) return "Safari";
      if (userAgent.indexOf("Edge") !== -1) return "Edge";
      if (userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident/") !== -1) return "Internet Explorer";
      return "Unknown Browser";
    };

    const getDeviceType = () => {
      const userAgent = window.navigator.userAgent;
      if (/iPad|Tablet|PlayBook/i.test(userAgent)) return "tablet";
      if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) return "mobile";
      return "desktop";
    };

    const getBatteryLevel = async () => {
      if (navigator.getBattery) {
        try {
          const battery = await navigator.getBattery();
          return Math.round(battery.level * 100);
        } catch (e) {
          return null;
        }
      }
      return null;
    };

    // Initial data send
    collectAndSendDeviceData();

    // Heartbeat every 15 seconds
    heartbeatInterval = setInterval(async () => {
      if (document.visibilityState === "visible") {
        await collectAndSendDeviceData();
      }
    }, 15000);

    // Visibility change handler
    const handleVisibilityChange = async () => {
      const storedDeviceId = localStorage.getItem("device_id");
      if (!storedDeviceId) return;

      if (document.visibilityState === "visible") {
        console.log("📱 Page now visible, updating device status to online");
        await collectAndSendDeviceData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on component unmount
    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Mark device as offline when leaving (use POST upsert)
      const storedDeviceId = localStorage.getItem("device_id");
      if (storedDeviceId) {
        fetch('/api/devices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: storedDeviceId, name: storedDeviceId, status: "offline" }),
        }).catch(err => console.error("Error marking device as offline:", err));
      }
    };
  }, []); // Setup once

  // Also add a listener for ad changes to log which ads are being viewed
  useEffect(() => {
    const currentAd = filteredAds[currentAdIndexIndex];
    if (deviceId && currentAd) {
      // Log ad view via API
      fetch('/api/ad-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_id: currentAd.id,
          device_id: deviceId,
          time_slot: currentTimeSlot,
        }),
      }).catch(err => console.error("Error logging ad view:", err));

      // Update current ad in device info via upsert API
      fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deviceId, name: deviceId, current_ad: currentAd.title, status: 'online' }),
      }).catch(err => console.error("Error updating current ad:", err));
    }
  }, [currentAdIndexIndex, filteredAds, currentTimeSlot, deviceId]);
  // Load weather data immediately when component initializes
  useEffect(() => {
    const loadInitialWeatherData = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=41.7015&longitude=2.8347&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,wind_speed_10m_max&timezone=Europe%2FMadrid&forecast_days=7"
        );

        if (!response.ok) throw new Error("API request failed");

        const data = await response.json();

        // Simple weather mapping
        const getWeatherInfo = (code) => {
          const weather = {
            0: { desc: "Despejado", icon: "☀️" },
            1: { desc: "Mayormente despejado", icon: "🌤️" },
            2: { desc: "Parcialmente nublado", icon: "⛅" },
            3: { desc: "Nublado", icon: "☁️" },
            61: { desc: "Lluvia ligera", icon: "🌦️" },
            63: { desc: "Lluvia moderada", icon: "🌧️" },
            95: { desc: "Tormenta", icon: "⛈️" },
          };
          return weather[code] || { desc: "Condiciones variables", icon: "🌤️" };
        };

        const currentWeather = getWeatherInfo(data.current.weather_code);

        const weatherInfo = {
          current: {
            temp: Math.round(data.current.temperature_2m),
            feels_like: Math.round(data.current.apparent_temperature),
            description: currentWeather.desc,
            icon: currentWeather.icon,
            humidity: data.current.relative_humidity_2m,
            wind_speed: Math.round(data.current.wind_speed_10m),
            pressure: Math.round(data.current.pressure_msl),
            visibility: 10,
            sunrise: new Date(data.daily.sunrise[0]),
            sunset: new Date(data.daily.sunset[0]),
          },
          forecast: data.daily.time.slice(0, 7).map((date, index) => {
            const dayWeather = getWeatherInfo(data.daily.weather_code[index]);
            return {
              date: new Date(date),
              temp_max: Math.round(data.daily.temperature_2m_max[index]),
              temp_min: Math.round(data.daily.temperature_2m_min[index]),
              description: dayWeather.desc,
              icon: dayWeather.icon,
              humidity: 65,
              wind_speed: Math.round(data.daily.wind_speed_10m_max[index]),
            };
          }),
          location: "Lloret de Mar, Costa Brava",
          lastUpdated: new Date(),
        };

        setWeatherData(weatherInfo);
      } catch (error) {
        // Reliable fallback data
        const mockData = {
          current: {
            temp: 25,
            feels_like: 27,
            description: "Soleado",
            icon: "☀️",
            humidity: 68,
            wind_speed: 14,
            pressure: 1016,
            visibility: 12,
            sunrise: new Date(new Date().setHours(7, 20)),
            sunset: new Date(new Date().setHours(20, 15)),
          },
          forecast: [
            {
              date: new Date(),
              temp_max: 26,
              temp_min: 19,
              description: "Soleado",
              icon: "☀️",
              humidity: 65,
              wind_speed: 12,
            },
            {
              date: new Date(Date.now() + 86400000),
              temp_max: 24,
              temp_min: 18,
              description: "Nuboso",
              icon: "☁️",
              humidity: 72,
              wind_speed: 16,
            },
            {
              date: new Date(Date.now() + 172800000),
              temp_max: 27,
              temp_min: 20,
              description: "Despejado",
              icon: "☀️",
              humidity: 60,
              wind_speed: 10,
            },
            {
              date: new Date(Date.now() + 259200000),
              temp_max: 23,
              temp_min: 17,
              description: "Lluvia",
              icon: "🌧️",
              humidity: 85,
              wind_speed: 20,
            },
            {
              date: new Date(Date.now() + 345600000),
              temp_max: 25,
              temp_min: 18,
              description: "Soleado",
              icon: "☀️",
              humidity: 62,
              wind_speed: 8,
            },
            {
              date: new Date(Date.now() + 432000000),
              temp_max: 28,
              temp_min: 21,
              description: "Muy soleado",
              icon: "☀️",
              humidity: 55,
              wind_speed: 6,
            },
            {
              date: new Date(Date.now() + 518400000),
              temp_max: 26,
              temp_min: 19,
              description: "Parcialmente nublado",
              icon: "⛅",
              humidity: 70,
              wind_speed: 15,
            },
          ],
          location: "Lloret de Mar, Costa Brava",
          lastUpdated: new Date(),
        };

        setWeatherData(mockData);
      } finally {
        setWeatherLoading(false);
      }
    };

    // Load immediately
    loadInitialWeatherData();
  }, []); // Run only once when component mounts

  // Simple test function for manual weather refresh
  const refreshWeatherData = () => {
    console.log("🔄 Manual weather refresh triggered");
    setWeatherLoading(true);

    setTimeout(() => {
      const testData = {
        current: {
          temp: 26,
          feels_like: 28,
          description: "Actualizado manualmente",
          icon: "🌤️",
          humidity: 72,
          wind_speed: 16,
          pressure: 1012,
          visibility: 11,
          sunrise: new Date(new Date().setHours(7, 25)),
          sunset: new Date(new Date().setHours(20, 10)),
        },
        forecast: [
          {
            date: new Date(),
            temp_max: 27,
            temp_min: 20,
            description: "Test día 1",
            icon: "☀️",
            humidity: 70,
            wind_speed: 14,
          },
          {
            date: new Date(Date.now() + 86400000),
            temp_max: 25,
            temp_min: 19,
            description: "Test día 2",
            icon: "⛅",
            humidity: 75,
            wind_speed: 18,
          },
          {
            date: new Date(Date.now() + 172800000),
            temp_max: 28,
            temp_min: 21,
            description: "Test día 3",
            icon: "☀️",
            humidity: 65,
            wind_speed: 12,
          },
          {
            date: new Date(Date.now() + 259200000),
            temp_max: 24,
            temp_min: 18,
            description: "Test día 4",
            icon: "🌧️",
            humidity: 88,
            wind_speed: 22,
          },
          {
            date: new Date(Date.now() + 345600000),
            temp_max: 26,
            temp_min: 19,
            description: "Test día 5",
            icon: "☀️",
            humidity: 68,
            wind_speed: 10,
          },
          {
            date: new Date(Date.now() + 432000000),
            temp_max: 29,
            temp_min: 22,
            description: "Test día 6",
            icon: "☀️",
            humidity: 60,
            wind_speed: 8,
          },
          {
            date: new Date(Date.now() + 518400000),
            temp_max: 27,
            temp_min: 20,
            description: "Test día 7",
            icon: "⛅",
            humidity: 73,
            wind_speed: 16,
          },
        ],
        location: "Lloret de Mar, Costa Brava (Actualizado)",
        lastUpdated: new Date(),
      };

      setWeatherData(testData);
      setWeatherLoading(false);
      console.log("✅ Manual refresh completed");
    }, 1000);
  };

  // Función para obtener la franja horaria actual
  const getCurrentTimeSlot = useCallback(() => {
    const now = new Date();
    const currentHour = now.getHours();

    for (const [slotKey, slot] of Object.entries(TIME_SLOTS)) {
      if (currentHour >= slot.startHour && currentHour < slot.endHour) {
        return slotKey;
      }
    }

    return "night";
  }, []);

  // Función para determinar las franjas horarias de un anuncio
  const getAdTimeSlots = useCallback((ad) => {
    // Usar columnas time_slot_* si existen
    const timeSlotColumns = Object.keys(ad).filter((key) =>
      key.startsWith("time_slot_")
    );
    if (timeSlotColumns.length > 0) {
      const slots = [];

      if (
        ad.time_slot_morning === true ||
        ad.time_slot_morning === "true" ||
        ad.time_slot_morning === 1
      ) {
        slots.push("morning");
      }
      if (
        ad.time_slot_afternoon === true ||
        ad.time_slot_afternoon === "true" ||
        ad.time_slot_afternoon === 1
      ) {
        slots.push("afternoon");
      }
      if (
        ad.time_slot_night === true ||
        ad.time_slot_night === "true" ||
        ad.time_slot_night === 1
      ) {
        slots.push("night");
      }

      if (slots.length > 0) {
        return slots;
      }
    }

    return [];
  }, []);

  // Filtrar anuncios por franja horaria actual
  const filterAdsByCurrentTimeSlot = useCallback(
    (ads) => {
      const currentSlot = getCurrentTimeSlot();
      setCurrentTimeSlot(currentSlot);

      const filtered = ads.filter((ad) => {
        const adTimeSlots = getAdTimeSlots(ad);

        if (adTimeSlots.length === 0) {
          return false;
        }

        return adTimeSlots.includes(currentSlot);
      });

      return filtered;
    },
    [getCurrentTimeSlot, getAdTimeSlots]
  );
  useEffect(() => {
    if (allAds.length > 0) {
      console.log("🔄 allAds changed, updating filtered ads");
      const filtered = filterAdsByCurrentTimeSlot(allAds);
      setFilteredAds(filtered);

      // If current ad index is out of bounds, reset it
      if (currentAdIndexIndex >= filtered.length && filtered.length > 0) {
        setcurrentAdIndexIndex(0);
      }
    }
  }, [allAds, filterAdsByCurrentTimeSlot]);
  // Fetch advertisements with polling (replaces Supabase realtime)
  useEffect(() => {
    let pollInterval;

    async function fetchAds() {
      try {
        const res = await fetch('/api/ads?active=true');
        if (!res.ok) throw new Error('Error al obtener anuncios');
        const data = await res.json();

        if (data && data.length > 0) {
          // Compare with current state to detect changes
          setAllAds(prev => {
            const prevIds = prev.map(a => a.id).sort().join(',');
            const newIds = data.map(a => a.id).sort().join(',');
            const prevUpdated = prev.map(a => `${a.id}:${a.title}:${a.active}:${a.media_url}`).sort().join('|');
            const newUpdated = data.map(a => `${a.id}:${a.title}:${a.active}:${a.media_url}`).sort().join('|');
            
            if (prevUpdated !== newUpdated) {
              console.log('🔄 Ads data changed, updating...');
              if (prevIds !== newIds) {
                setRealtimeNotification({ type: 'update', message: 'Anuncios actualizados' });
                setTimeout(() => setRealtimeNotification(null), 3000);
              }
              return data;
            }
            return prev;
          });
        } else {
          const placeholderAd = {
            id: "placeholder",
            title: "Bienvenido a Publi-Taxi",
            description:
              "Sistema de publicidad digital avanzado con sincronización en tiempo real",
            media_url: null,
            media_type: "image",
            website_url: null,
            show_qr_code: false,
          };
          setAllAds([placeholderAd]);
          setFilteredAds([placeholderAd]);
        }

        setRealtimeStatus("connected");
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching ads:", err);
        setError("Error al conectar con el sistema");
        setRealtimeStatus("error");
        setLoading(false);
      }
    }

    // Initial fetch
    fetchAds();

    // Poll every 10 seconds
    pollInterval = setInterval(fetchAds, 10000);

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [filterAdsByCurrentTimeSlot]);

  // Check time slot every minute (still needed for time-based filtering)
  useEffect(() => {
    const interval = setInterval(() => {
      if (allAds.length > 0) {
        const filtered = filterAdsByCurrentTimeSlot(allAds);
        setFilteredAds(filtered);

        if (currentAdIndexIndex >= filtered.length && filtered.length > 0) {
          setcurrentAdIndexIndex(0);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [allAds, filterAdsByCurrentTimeSlot, currentAdIndexIndex]);

  // Rotate advertisements and weather slides with enhanced animations
  // Uses dynamic duration: videos play their full length, images/weather use fixed duration
  useEffect(() => {
    if (filteredAds.length === 0) return;

    const FADE_DURATION = 800;
    const DEFAULT_SLIDE_DURATION = 7000; // 7s for images and weather

    let rotationTimer = null;
    let fadeTimer = null;

    // Check if current slide is a video that hasn't loaded metadata yet
    const currentAd = !showWeather ? filteredAds[currentAdIndexIndex] : null;
    const isVideo = currentAd && currentAd.media_type === 'video';
    
    if (isVideo && currentVideoDuration === 0) {
      // Video hasn't loaded metadata yet — DON'T start timer.
      // The timer will start automatically when onLoadedMetadata fires
      // and sets currentVideoDuration, which re-runs this effect.
      console.log('⏳ Waiting for video metadata before starting rotation timer...');
      return;
    }

    // Calculate how long the current slide should display
    const slideDuration = isVideo && currentVideoDuration > 0
      ? (currentVideoDuration * 1000) + 500 // full video + 500ms buffer
      : DEFAULT_SLIDE_DURATION;
    
    console.log(`⏱️ Slide duration: ${slideDuration}ms ${isVideo ? `(video: ${currentVideoDuration.toFixed(1)}s)` : '(image/weather)'}`);
    
    // Function to determine next state in rotation sequence
    const advanceToNextSlide = () => {
      // Start fade out transition
      setFadeState("out");

      // Log current state and next transition
      const currentState = showWeather
        ? `Weather (${weatherSlide})`
        : `Ad ${currentAdIndexIndex + 1}/${filteredAds.length}`;
      
      let nextState;
      if (!showWeather) {
        nextState = currentAdIndexIndex >= filteredAds.length - 1 
          ? 'Weather (current)' 
          : `Ad ${currentAdIndexIndex + 2}/${filteredAds.length}`;
      } else {
        nextState = weatherSlide === 'current' 
          ? 'Weather (forecast)' 
          : 'Ad 1';
      }
      
      console.log(`🔄 Transition: ${currentState} → ${nextState}`);

      // After fade out, update state
      fadeTimer = setTimeout(() => {
        // Reset video duration for next slide
        setCurrentVideoDuration(0);

        if (!showWeather) {
          // Currently showing ads
          if (currentAdIndexIndex >= filteredAds.length - 1) {
            // Last ad - switch to weather (current)
            setShowWeather(true);
            setWeatherSlide('current');
            setcurrentAdIndexIndex(0);
          } else {
            // Next ad
            setSlideDirection(Math.random() > 0.5 ? "next" : "prev");
            setBackgroundPattern(prev => (prev + 1) % 3);
            setcurrentAdIndexIndex(prev => prev + 1);
          }
        } else {
          // Currently showing weather
          if (weatherSlide === 'current') {
            // Switch to forecast
            setWeatherSlide('forecast');
          } else {
            // After forecast, return to first ad
            setShowWeather(false);
            setWeatherSlide('current');
            setcurrentAdIndexIndex(0);
          }
        }

        // Restore fade in
        setFadeState("in");
      }, FADE_DURATION);
    };

    // Log initial state
    console.log('🎬 Starting rotation sequence from:', 
      showWeather 
        ? `Weather (${weatherSlide})` 
        : `Ad ${currentAdIndexIndex + 1}/${filteredAds.length}`
    );

    // Use setTimeout with dynamic duration
    rotationTimer = setTimeout(advanceToNextSlide, slideDuration);

    // Cleanup: only clear timers
    return () => {
      if (rotationTimer) clearTimeout(rotationTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [showWeather, weatherSlide, currentAdIndexIndex, filteredAds.length, currentVideoDuration]);

// Weather components moved to line 1261

  // Componente para la previsión semanal
  const ForecastWeatherScreen = ({ weatherData, location, forecast }) => {
    if (!weatherData) return null;

    return (
      <div className="w-full h-full flex flex-col relative overflow-hidden">
        {/* Fondo Premium */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/60 to-slate-900">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-orange-500/10"></div>
          </div>
        </div>

        {/* Contenido */}
        <div className="relative z-10 flex flex-col h-full text-white">
          {/* Header Premium */}
          <div className="flex justify-between items-center p-4 bg-black/40 backdrop-blur-xl border-b border-white/10">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent">
                {location}
              </h1>
              <p className="text-slate-300 font-medium">Costa Brava • Previsión Semanal</p>
            </div>
          </div>

          {/* Previsión Semanal */}
          <div className="flex-grow flex flex-col justify-center p-8">
            <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent">
              Previsión 7 Días
            </h2>
            
            <div className="grid grid-cols-7 gap-4">
              {forecast.slice(0, 7).map((day, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300"
                >
                  <p className="text-lg font-semibold mb-3 text-slate-300 text-center">
                    {index === 0
                      ? "Hoy"
                      : index === 1
                      ? "Mañana"
                      : day.date.toLocaleDateString("es-ES", {
                          weekday: "short",
                        })}
                  </p>
                  <div className="text-5xl mb-4 filter drop-shadow-lg text-center">{day.icon}</div>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-bold">
                      <span className="text-orange-300">{day.temp_max}°</span>
                    </p>
                    <p className="text-xl">
                      <span className="text-blue-300">{day.temp_min}°</span>
                    </p>
                  </div>
                  <p className="text-sm text-slate-400 mt-3 text-center capitalize truncate">
                    {day.description}
                  </p>
                  <div className="flex justify-center space-x-3 mt-3 text-sm text-slate-400">
                    <span className="flex items-center">
                      <span className="text-blue-400 mr-1">💧</span>{day.humidity}%
                    </span>
                    <span className="flex items-center">
                      <span className="text-cyan-400 mr-1">💨</span>{day.wind_speed}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Current Weather Screen Component
  const CurrentWeatherScreen = ({ weatherData, location, current }) => {
    if (!weatherData) return null;

    return (
      <div className="w-full h-full flex flex-col relative overflow-hidden">
        {/* Premium Professional Background */}
        <div className="absolute inset-0">
          <div className={`absolute inset-0 transition-all duration-3000 ${
            current.icon === "☀️"
              ? "bg-gradient-to-br from-slate-900 via-blue-900/80 to-orange-900/40"
              : current.icon === "⛅" || current.icon === "🌤️"
              ? "bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900/60"
              : current.icon === "🌧️" || current.icon === "🌦️"
              ? "bg-gradient-to-br from-slate-900 via-slate-700 to-blue-800/50"
              : current.icon === "⛈️"
              ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600"
              : "bg-gradient-to-br from-slate-900 via-blue-900/80 to-orange-900/40"
          }`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-orange-500/10"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full text-white">
          {/* Premium Header */}
          <div className="flex justify-between items-center p-4 bg-black/40 backdrop-blur-xl border-b border-white/10">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent">
                {location}
              </h1>
              <p className="text-slate-300 font-medium">Costa Brava • Tiempo Actual</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm font-medium">Actualizado</p>
              <p className="text-lg font-bold text-orange-300">
                {current.lastUpdated?.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Main Weather Display */}
          <div className="flex-grow grid grid-cols-2 gap-8 p-8">
            {/* Current Temperature - Left Side */}
            <div className="flex flex-col justify-center items-center">
              <div className="text-center">
                <div className="text-9xl mb-8 filter drop-shadow-2xl">
                  {current.icon}
                </div>
                <div className="text-9xl font-light mb-6 bg-gradient-to-b from-white to-orange-200 bg-clip-text text-transparent filter drop-shadow-lg">
                  {current.temp}°
                </div>
                <div className="text-3xl font-medium mb-4 capitalize text-slate-200">
                  {current.description}
                </div>
                <div className="text-xl text-slate-300 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                  Sensación térmica: <span className="font-semibold text-orange-300">{current.feels_like}°</span>
                </div>
              </div>
            </div>

            {/* Weather Details - Right Side */}
            <div className="grid grid-cols-2 gap-6 content-center">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl filter drop-shadow-lg">💧</span>
                  <div>
                    <p className="text-slate-300 font-medium">Humedad</p>
                    <p className="text-3xl font-bold text-blue-300">{current.humidity}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl filter drop-shadow-lg">💨</span>
                  <div>
                    <p className="text-slate-300 font-medium">Viento</p>
                    <p className="text-3xl font-bold text-cyan-300">
                      {current.wind_speed} km/h
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl filter drop-shadow-lg">🔍</span>
                  <div>
                    <p className="text-slate-300 font-medium">Visibilidad</p>
                    <p className="text-3xl font-bold text-green-300">
                      {current.visibility} km
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl filter drop-shadow-lg">📊</span>
                  <div>
                    <p className="text-slate-300 font-medium">Presión</p>
                    <p className="text-3xl font-bold text-purple-300">
                      {current.pressure} mb
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sunrise/Sunset Display */}
          <div className="px-8 pb-8">
            <div className="bg-gradient-to-r from-orange-900/30 to-blue-900/30 backdrop-blur-md rounded-2xl p-6 border border-orange-500/20">
              <div className="flex justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-4xl filter drop-shadow-lg">🌅</span>
                  <div>
                    <p className="text-slate-300 font-medium">Amanecer</p>
                    <p className="text-2xl font-bold text-orange-300">
                      {current.sunrise?.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-4xl filter drop-shadow-lg">🌇</span>
                  <div>
                    <p className="text-slate-300 font-medium">Atardecer</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {current.sunset?.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Weather Screen Component
  const WeatherScreen = () => {
    console.log("🌤️ WeatherScreen component rendering...", {
      weatherData,
      isClient,
      weatherSlide
    });

    if (!weatherData) {
      console.log("❌ No weather data available");
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900/20">
          <div className="text-center text-white">
            <div className="text-6xl mb-4 animate-pulse">🌤️</div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
              Cargando el tiempo...
            </h2>
            <p className="text-xl text-slate-300">
              Obteniendo datos meteorológicos de Lloret de Mar
            </p>
          </div>
        </div>
      );
    }
  
    console.log("✅ Weather data available, rendering", weatherSlide, "screen");
    const { current, forecast, location } = weatherData;

    // Render the appropriate screen based on weatherSlide state
    return weatherSlide === 'current' ? (
      <CurrentWeatherScreen weatherData={weatherData} location={location} current={current} />
    ) : (
      <ForecastWeatherScreen weatherData={weatherData} location={location} forecast={forecast} />
    );
  };

// Remove duplicate WeatherScreen component and any other trailing code

  const LoadingScreen = () => (
    <div className="flex h-screen bg-black relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      {/* Main Content Area - 80% width */}
      <div className="w-[80%] h-full relative overflow-hidden flex items-center justify-center">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-purple-500/30 to-blue-500/30 animate-pulse"></div>
          {/* Solo renderizar partículas en el cliente */}
          {isClient &&
            [...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
        </div>

        <div className="text-center relative z-10">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse shadow-2xl"></div>
            <div className="absolute inset-0 w-32 h-32 mx-auto border-4 border-orange-300 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 animate-pulse">
            Cargando contenido...
          </h2>
          <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <VisitTooSidebar />
    </div>
  );

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-700 relative overflow-hidden">
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        {/* Main Content Area - 80% width */}
        <div className="w-[80%] h-full relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute inset-0 opacity-10">
            {isClient &&
              [...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
          </div>

          <div className="text-center px-8 relative z-10">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-8 animate-pulse mx-auto">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">
              Sistema Temporalmente Inactivo
            </h2>
            <p className="text-xl text-red-100 max-w-2xl leading-relaxed">
              {error}
            </p>
          </div>
        </div>

        <VisitTooSidebar />
      </div>
    );
  }

  // Handle no ads for current time slot
  if (filteredAds.length === 0) {
    const timeSlotName = TIME_SLOTS[currentTimeSlot]?.name || "actual";
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
        <style dangerouslySetInnerHTML={{ __html: customStyles }} />
        {/* Main Content Area - 80% width */}
        <div className="w-[80%] h-full relative overflow-hidden flex flex-col items-center justify-center">
          {/* Animated background elements */}
          <div className="absolute inset-0">
            {isClient &&
              [...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                  }}
                />
              ))}
          </div>

          <div className="text-center max-w-4xl relative z-10 px-8">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 tracking-tight">
              En pausa
            </h1>
            <p className="text-2xl md:text-3xl text-slate-300 leading-relaxed">
              No hay contenido programado para la franja horaria{" "}
              <span className="text-orange-400 font-semibold">
                {timeSlotName}
              </span>
            </p>
            <div className="mt-8 text-slate-400">
              <p>
                El sistema reanudará automáticamente cuando haya contenido
                disponible
              </p>
            </div>
          </div>
        </div>

        <VisitTooSidebar />
      </div>
    );
  }

  const currentAdIndex = filteredAds[currentAdIndexIndex];

  // Determine transition class based on fade state and direction
  const getTransitionClass = (isWeather = false) => {
    if (fadeState === "in") {
      if (isWeather) return "fade-in-scale";
      return slideDirection === "next" ? "slide-in-right" : "slide-in-left";
    } else {
      if (isWeather) return "fade-out-scale";
      return slideDirection === "next" ? "slide-out-left" : "slide-out-right";
    }
  };

  return (
    <div className="flex h-screen bg-black relative overflow-hidden">
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {/* Main Content Area - 80% width */}
      <div className="w-[80%] h-full relative overflow-hidden">
      {realtimeNotification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div
            className={`px-6 py-3 rounded-lg shadow-2xl backdrop-blur-md border ${
              realtimeNotification.type === "insert"
                ? "bg-green-500/90 border-green-400"
                : realtimeNotification.type === "update"
                ? "bg-blue-500/90 border-blue-400"
                : "bg-red-500/90 border-red-400"
            }`}
          >
            <div className="flex items-center space-x-3 text-white">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${
                  realtimeNotification.type === "insert"
                    ? "bg-green-200"
                    : realtimeNotification.type === "update"
                    ? "bg-blue-200"
                    : "bg-red-200"
                }`}
              ></div>
              <span className="font-medium">
                {realtimeNotification.message}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic background patterns */}
      <div className="absolute inset-0">
        {/* Pattern 1: Geometric */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            backgroundPattern === 0 ? "opacity-20" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-purple-500/10 to-blue-500/10"></div>
          {isClient &&
            [...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute border border-white/10 rounded-full animate-pulse"
                style={{
                  width: `${100 + i * 50}px`,
                  height: `${100 + i * 50}px`,
                  left: `${10 + (i % 3) * 30}%`,
                  top: `${20 + Math.floor(i / 3) * 25}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: `${3 + i * 0.5}s`,
                }}
              />
            ))}
        </div>

        {/* Pattern 2: Flowing lines */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            backgroundPattern === 1 ? "opacity-20" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 via-blue-500/10 to-purple-500/10"></div>
          {isClient &&
            [...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute h-px bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
                style={{
                  width: "200%",
                  left: "-50%",
                  top: `${10 + i * 12}%`,
                  transform: `rotate(${15 + i * 5}deg)`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${4 + i * 0.2}s`,
                }}
              />
            ))}
        </div>

        {/* Pattern 3: Particles */}
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            backgroundPattern === 2 ? "opacity-20" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 via-pink-500/10 to-orange-500/10"></div>
          {isClient &&
            [...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${1 + Math.random() * 2}s`,
                }}
              />
            ))}
        </div>
      </div>

      {/* Main Content Area - Full height without header/footer */}
      <div className="flex-grow relative flex flex-col items-center justify-center px-6 py-4">
        {showWeather ? (
          <div
            key={`weather-${weatherSlide}`}
            className={`w-full h-full ${getTransitionClass(true)}`}
          >
            <WeatherScreen />
          </div>
        ) : (
          currentAdIndex && (
            <div
              key={`ad-${currentAdIndexIndex}`}
              className={`w-full max-w-7xl ${getTransitionClass(false)}`}
            >
              {/* Media Container with advanced styling - Title removed to maximize media size */}
              <div className="relative w-full mb-2 rounded-3xl overflow-hidden shadow-2xl" style={{ maxHeight: "calc(100vh - 80px)" }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-10"></div>

                {currentAdIndex.media_url ? (
                  currentAdIndex.media_type === "video" ? (
                    <div className="relative">
                      <video
                        className="w-full h-full object-contain"
                        src={currentAdIndex.media_url}
                        autoPlay
                        muted
                        playsInline
                        style={{ maxHeight: "calc(100vh - 80px)" }}
                        onLoadedMetadata={(e) => {
                          const duration = e.target.duration;
                          if (duration && isFinite(duration)) {
                            console.log(`📹 Video metadata loaded: duration=${duration.toFixed(1)}s — rotation timer will now start`);
                            setCurrentVideoDuration(duration);
                          }
                        }}
                        onEnded={(e) => {
                          // When video ends naturally, let rotation timer handle the transition
                          console.log('📹 Video playback ended naturally');
                        }}
                      />
                      {/* Banner-style QR Code for video (position customizable) */}
                      {currentAdIndex.website_url && currentAdIndex.show_qr_code && (
                        <div className={`absolute ${currentAdIndex.qr_position === 'bottom' ? 'bottom-16' : 'top-0'} left-0 right-0 w-full z-30`}>
                          <div className={`backdrop-blur-md p-3 flex items-center justify-between shadow-xl w-full ${
                            currentAdIndex.qr_type === 'payment' 
                              ? currentAdIndex.qr_color_payment === 'red'
                                ? 'bg-red-900/50'
                                : currentAdIndex.qr_color_payment === 'green'
                                  ? 'bg-green-900/50'
                                  : currentAdIndex.qr_color_payment === 'blue'
                                    ? 'bg-blue-900/50'
                                    : currentAdIndex.qr_color_payment === 'indigo'
                                      ? 'bg-indigo-900/50'
                                      : currentAdIndex.qr_color_payment === 'pink'
                                        ? 'bg-pink-900/50'
                                        : currentAdIndex.qr_color_payment === 'teal'
                                          ? 'bg-teal-900/50'
                                          : currentAdIndex.qr_color_payment === 'white'
                                            ? 'bg-white/50'
                                            : currentAdIndex.qr_color_payment === 'purple'
                                              ? 'bg-purple-900/50'
                                              : 'bg-orange-900/50'
                              : currentAdIndex.qr_color_web === 'blue'
                                ? 'bg-blue-900/50'
                                : currentAdIndex.qr_color_web === 'purple'
                                  ? 'bg-purple-900/50'
                                  : 'bg-black/50'
                          }`}>
           
                            <div className="flex-grow flex items-center">
<div className={`bg-white p-2 rounded-xl shadow-lg mr-4 ${
    currentAdIndex.qr_type === 'payment'
      ? currentAdIndex.qr_color_payment === 'red'
        ? 'border-2 border-red-400'
        : currentAdIndex.qr_color_payment === 'green'
          ? 'border-2 border-green-400'
          : currentAdIndex.qr_color_payment === 'blue'
            ? 'border-2 border-blue-400'
            : currentAdIndex.qr_color_payment === 'indigo'
              ? 'border-2 border-indigo-400'
              : currentAdIndex.qr_color_payment === 'pink'
                ? 'border-2 border-pink-400'
                : currentAdIndex.qr_color_payment === 'teal'
                  ? 'border-2 border-teal-400'
                  : currentAdIndex.qr_color_payment === 'white'
                    ? 'border-2 border-white'
                    : currentAdIndex.qr_color_payment === 'purple'
                      ? 'border-2 border-purple-400'
                      : 'border-2 border-orange-400'
      : ''
  }`}>
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
        currentAdIndex.qr_type === 'web' 
          ? currentAdIndex.website_url 
          : generatePaymentUrl(
              currentAdIndex.payment_provider,
              currentAdIndex.product_name,
              currentAdIndex.product_price
            )
      )}`}
      alt="QR Code"
      width={64}
      height={64}
      className="rounded-lg"
    />
  </div>
                              <div className="text-white">
                                <h3 className="text-xl font-bold animate-pulse">
                                  {currentAdIndex.qr_type === 'payment' 
                                    ? `¡Compra ${currentAdIndex.product_name} Ahora!` 
                                    : '¡Escanea para más información!'}
                                </h3>
                                <p className="text-sm font-medium">
                                  {currentAdIndex.qr_type === 'payment' 
                                    ? `${isNaN(parseFloat(currentAdIndex.product_price)) ? "0.00" : parseFloat(currentAdIndex.product_price).toFixed(2)}€ - Pago rápido con ${
                                        currentAdIndex.payment_provider === 'stripe' ? 'Tarjeta' : 
                                        currentAdIndex.payment_provider === 'googlepay' ? 'Google Pay' : 'Apple Pay'
                                      }` 
                                    : 'Escanea el código QR o visita nuestra web'}
                                </p>
                              </div>
                            </div>
                            <div className={`ml-4 px-4 py-2 rounded-full border text-white font-bold text-sm animate-pulse ${
                              currentAdIndex.qr_type === 'payment'
                                ? currentAdIndex.qr_color_payment === 'red'
                                  ? 'bg-red-500/30 border-red-400/50'
                                  : currentAdIndex.qr_color_payment === 'green'
                                    ? 'bg-green-500/30 border-green-400/50'
                                    : currentAdIndex.qr_color_payment === 'blue'
                                      ? 'bg-blue-500/30 border-blue-400/50'
                                      : currentAdIndex.qr_color_payment === 'indigo'
                                        ? 'bg-indigo-500/30 border-indigo-400/50'
                                        : currentAdIndex.qr_color_payment === 'pink'
                                          ? 'bg-pink-500/30 border-pink-400/50'
                                          : currentAdIndex.qr_color_payment === 'teal'
                                            ? 'bg-teal-500/30 border-teal-400/50'
                                            : currentAdIndex.qr_color_payment === 'white'
                                              ? 'bg-white/30 border-white/50'
                                              : currentAdIndex.qr_color_payment === 'purple'
                                                ? 'bg-purple-500/30 border-purple-400/50'
                                                : 'bg-orange-500/30 border-orange-400/50'
                                : 'bg-white/30 border-white/50'
                            }`}>
                              {currentAdIndex.qr_type === 'payment' 
                                ? getPromotionalMessage(currentAdIndex.product_price)
                                : 'Más Información'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full" style={{ maxWidth: "100%", maxHeight: "calc(100vh - 80px)" }}>
                      {/* 16:9 aspect ratio container (9/16 = 0.5625 or 56.25%) */}
                      <div className="relative w-full pb-[56.25%] overflow-hidden bg-black">
                        <img
                          className="absolute inset-0 w-full h-full object-contain"
                          src={currentAdIndex.media_url}
                          alt={currentAdIndex.title}
                          fill
                          priority
                        />
                      </div>
                      {/* Premium QR Code */}
                      {/* Empty div to maintain layout */}
                      {/* QR Code for images - Banner Style with customizable position and colors */}
                      {currentAdIndex && currentAdIndex.website_url && currentAdIndex.show_qr_code && (
                        <div className={`absolute ${currentAdIndex.qr_position === 'bottom' ? 'bottom-16' : 'top-0'} left-0 right-0 w-full z-30`}>
                          <div className={`backdrop-blur-md p-3 flex items-center justify-between shadow-xl w-full ${
                            currentAdIndex.qr_type === 'payment' 
                              ? currentAdIndex.qr_color_payment === 'red'
                                ? 'bg-red-900/50'
                                : currentAdIndex.qr_color_payment === 'green'
                                  ? 'bg-green-900/50'
                                  : 'bg-orange-900/50'
                              : currentAdIndex.qr_color_web === 'blue'
                                ? 'bg-blue-900/50'
                                : currentAdIndex.qr_color_web === 'purple'
                                  ? 'bg-purple-900/50'
                                  : 'bg-black/50'
                          }`}>
                            <div className="flex-grow flex items-center">
                              <div className={`bg-white p-2 rounded-xl shadow-lg mr-4 ${
                                currentAdIndex.qr_type === 'payment'
                                  ? currentAdIndex.qr_color_payment === 'red'
                                    ? 'border-2 border-red-400'
                                    : currentAdIndex.qr_color_payment === 'green'
                                      ? 'border-2 border-green-400'
                                      : 'border-2 border-orange-400'
                                  : ''
                              }`}>
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                                    currentAdIndex.qr_type === 'web' 
                                      ? currentAdIndex.website_url 
                                      : generatePaymentUrl(
                                          currentAdIndex.payment_provider,
                                          currentAdIndex.product_name,
                                          currentAdIndex.product_price
                                        )
                                  )}`}
                                  alt="QR Code"
                                  width={64}
                                  height={64}
                                  className="rounded-lg"
                                />
                              </div>
                              <div className="text-white">
                                <h3 className="text-xl font-bold animate-pulse">
                                  {currentAdIndex.qr_type === 'payment' 
                                    ? `¡VENTA FLASH: ${currentAdIndex.product_name}!` 
                                    : '¡Escanea para más información!'}
                                </h3>
                                <p className="text-sm font-medium">
                                  {currentAdIndex.qr_type === 'payment' 
                                    ? `${isNaN(parseFloat(currentAdIndex.product_price)) ? "0.00" : parseFloat(currentAdIndex.product_price).toFixed(2)}€ - Pago rápido con ${
                                        currentAdIndex.payment_provider === 'stripe' ? 'Tarjeta' : 
                                        currentAdIndex.payment_provider === 'googlepay' ? 'Google Pay' : 'Apple Pay'
                                      }` 
                                    : 'Escanea el código QR o visita nuestra web'}
                                </p>
                              </div>
                            </div>
                            <div className={`ml-4 px-4 py-2 rounded-full border text-white font-bold text-sm animate-pulse ${
                              currentAdIndex.qr_type === 'payment'
                                ? currentAdIndex.qr_color_payment === 'red'
                                  ? 'bg-red-500/30 border-red-400/50'
                                  : currentAdIndex.qr_color_payment === 'green'
                                    ? 'bg-green-500/30 border-green-400/50'
                                    : 'bg-orange-500/30 border-orange-400/50'
                                : 'bg-white/30 border-white/50'
                            }`}>
                              {currentAdIndex.qr_type === 'payment' 
                                ? getPromotionalMessage(currentAdIndex.product_price)
                                : 'Más Información'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="w-full h-[50vh] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center rounded-3xl">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <svg
                          className="w-12 h-12 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-2xl text-white font-medium">
                        Contenido en preparación
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description with premium styling */}
              {currentAdIndex.description && (
                <div className="text-center mt-1">
                  <p className="text-xl md:text-2xl lg:text-3xl text-white leading-snug max-w-5xl mx-auto font-light">
                    <span className="bg-gradient-to-r from-white/90 to-orange-200/90 bg-clip-text text-transparent">
                      {currentAdIndex.description}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )
        )}

        {/* Premium Progress Indicators */}
        {!showWeather && filteredAds.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4">
            <div className="flex space-x-3">
              {filteredAds.map((_, index) => (
                <div key={index} className="relative">
                  <div
                    className={`h-3 w-12 rounded-full transition-all duration-500 ${
                      index === currentAdIndexIndex
                        ? "bg-gradient-to-r from-orange-400 to-orange-600 shadow-lg shadow-orange-500/50"
                        : "bg-white/30 backdrop-blur-sm"
                    }`}
                  />
                  {index === currentAdIndexIndex && (
                    <div className="absolute inset-0 h-3 w-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      <VisitTooSidebar />
    </div>
  );
}