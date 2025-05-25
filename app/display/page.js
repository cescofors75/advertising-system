"use client";

import { useState, useEffect, useCallback } from "react";
import supabase from "@/lib/supabaseClient";
import { generatePaymentUrl, getPromotionalMessage } from "@/lib/paymentUtils";

// Brand colors
const ORANGE = "#ff8000";
const GRADIENT =
  "linear-gradient(135deg, #ff8000 0%, #ff6b00 50%, #e55a00 100%)";
const DARK_GRADIENT =
  "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #404040 100%)";

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
  const [realtimeStatus, setRealtimeStatus] = useState("connecting"); // connecting, connected, error
  const [realtimeNotification, setRealtimeNotification] = useState(null); // For showing update notifications
  const [weatherData, setWeatherData] = useState(null);
  const [showWeather, setShowWeather] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(true); // Start as loading

  // First, add this new state variable to your existing state declarations
  const [deviceId, setDeviceId] = useState("");

  // Add this useEffect hook to collect and send device data
  // Add this useEffect hook to collect and send device data
  useEffect(() => {
    let deviceId = "";

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

      // Get current ad details from your existing state
      const currentAd =
        currentAdIndexIndex >= 0 &&
        filteredAds.length > 0 &&
        filteredAds[currentAdIndexIndex]
          ? filteredAds[currentAdIndexIndex]
          : null;

      // Collect device information
      const deviceInfo = {
        id: deviceIdentifier,
        name: deviceIdentifier, // You could customize this with a friendly name
        ip: "", // This will be captured on the server side
        last_seen: new Date().toISOString(),
        os: getOperatingSystem(),
        browser: getBrowserInfo(),
        device_type: getDeviceType(),
        location: "", // Could be filled in server-side or with user permission
        status: "online",
        network: navigator.connection
          ? navigator.connection.effectiveType
          : "unknown",
        resolution: `${window.screen.width}x${window.screen.height}`,
        user_agent: navigator.userAgent,
        first_seen:
          localStorage.getItem("first_seen") || new Date().toISOString(),
        battery: await getBatteryLevel(),
        memory_usage: null, // Not available in most browsers
        cpu_usage: null, // Not available in most browsers
        current_ad: currentAd ? currentAd.title : null,
        current_time_slot: currentTimeSlot,
      };

      // Save first seen date if it doesn't exist
      if (!localStorage.getItem("first_seen")) {
        localStorage.setItem("first_seen", deviceInfo.first_seen);
      }

      // Send to Supabase
      try {
        // First try to update if the device already exists
        const { error: upsertError } = await supabase
          .from("connected_devices")
          .upsert(deviceInfo, { onConflict: "id" });

        if (upsertError) throw upsertError;

        console.log("✅ Device info updated successfully");

        // If there's a current ad, log the view
        if (currentAd) {
          const adViewKey = `ad_view_${currentAd.id}_${currentAdIndexIndex}`;
          if (!localStorage.getItem(adViewKey)) {
            // Log ad view to Supabase
            const { error: adViewError } = await supabase
              .from("ad_views")
              .insert([
                {
                  device_id: deviceIdentifier,
                  ad_id: currentAd.id,
                  timestamp: new Date().toISOString(),
                  time_slot: currentTimeSlot,
                },
              ]);

            if (adViewError) {
              console.error("Error logging ad view:", adViewError);
            } else {
              // Mark this ad as viewed for this session to avoid duplicate logs
              localStorage.setItem(adViewKey, "viewed");
              console.log("✅ Ad view logged successfully");
            }
          }
        }
      } catch (error) {
        console.error("❌ Error updating device info:", error);
      }
    };

    // Helper functions to get device information
    const getOperatingSystem = () => {
      const userAgent = window.navigator.userAgent;

      if (userAgent.indexOf("Windows") !== -1) return "Windows";
      if (userAgent.indexOf("Mac") !== -1) return "macOS";
      if (userAgent.indexOf("Linux") !== -1) return "Linux";
      if (userAgent.indexOf("Android") !== -1) return "Android";
      if (
        userAgent.indexOf("iOS") !== -1 ||
        userAgent.indexOf("iPhone") !== -1 ||
        userAgent.indexOf("iPad") !== -1
      )
        return "iOS";

      return "Unknown OS";
    };

    const getBrowserInfo = () => {
      const userAgent = window.navigator.userAgent;

      if (userAgent.indexOf("Chrome") !== -1) return "Chrome";
      if (userAgent.indexOf("Firefox") !== -1) return "Firefox";
      if (userAgent.indexOf("Safari") !== -1) return "Safari";
      if (userAgent.indexOf("Edge") !== -1) return "Edge";
      if (
        userAgent.indexOf("MSIE") !== -1 ||
        userAgent.indexOf("Trident/") !== -1
      )
        return "Internet Explorer";

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

    // Initial data collection
    collectAndSendDeviceData();

    // Set up interval to update device info every minute
    const intervalId = setInterval(collectAndSendDeviceData, 60000);

    // Set up visibility change detection to update status
    const handleVisibilityChange = async () => {
      // Get stored device ID
      const storedDeviceId = localStorage.getItem("device_id");
      if (!storedDeviceId) return;

      if (document.visibilityState === "visible") {
        // Page is visible again, update status to online
        try {
          const { error } = await supabase
            .from("connected_devices")
            .update({ status: "online", last_seen: new Date().toISOString() })
            .eq("id", storedDeviceId);

          if (error) throw error;
        } catch (error) {
          console.error("Error updating device status:", error);
        }
      } else {
        // Page is hidden, update status to offline
        try {
          const { error } = await supabase
            .from("connected_devices")
            .update({ status: "offline", last_seen: new Date().toISOString() })
            .eq("id", storedDeviceId);

          if (error) throw error;
        } catch (error) {
          console.error("Error updating device status:", error);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup on component unmount
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Get stored device ID
      const storedDeviceId = localStorage.getItem("device_id");
      if (!storedDeviceId) return;

      // Mark device as offline when leaving the page
      supabase
        .from("connected_devices")
        .update({ status: "offline", last_seen: new Date().toISOString() })
        .eq("id", storedDeviceId)
        .then(({ error }) => {
          if (error) console.error("Error marking device as offline:", error);
        });
    };
  }, [currentAdIndexIndex, filteredAds, currentTimeSlot]); // These are the variables used from your component

  // Also add a listener for ad changes to log which ads are being viewed
  useEffect(() => {
    if (deviceId && currentAdIndex) {
      // Log ad view to Supabase
      supabase
        .from("ad_views")
        .insert([
          {
            device_id: deviceId,
            ad_id: currentAdIndex.id,
            timestamp: new Date().toISOString(),
            time_slot: currentTimeSlot,
          },
        ])
        .then(({ error }) => {
          if (error) console.error("Error logging ad view:", error);
        });

      // Update current ad in device info
      supabase
        .from("connected_devices")
        .update({ current_ad: currentAdIndex.title })
        .eq("id", deviceId)
        .then(({ error }) => {
          if (error) console.error("Error updating current ad:", error);
        });
    }
  }, [currentAdIndexIndex, filteredAds, currentTimeSlot]);
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
  // Fetch advertisements with realtime subscription
  useEffect(() => {
    let channel;

    async function setupRealtimeSubscription() {
      try {
        // Initial fetch
        const { data, error } = await supabase
          .from("advertisements")
          .select("*")
          .eq("active", true)
          .order("id");

        if (error) throw error;

        if (data && data.length > 0) {
          setAllAds(data);
          const filtered = filterAdsByCurrentTimeSlot(data);
          setFilteredAds(filtered);
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

        // Setup realtime subscription
        channel = supabase
          .channel("advertisements_realtime")
          .on(
            "postgres_changes",
            {
              event: "*", // Listen to all events: INSERT, UPDATE, DELETE
              schema: "public",
              table: "advertisements",
            },
            (payload) => {
              setRealtimeStatus("connected");

              // Handle different types of changes
              if (payload.eventType === "INSERT") {
                setRealtimeNotification({
                  type: "insert",
                  message: "Nuevo anuncio agregado",
                });
                if (payload.new.active) {
                  setAllAds((prev) => {
                    const updated = [
                      ...prev.filter((ad) => ad.id !== "placeholder"),
                      payload.new,
                    ].sort((a, b) => a.id - b.id);
                    return updated;
                  });
                }
              } else if (payload.eventType === "UPDATE") {
                setRealtimeNotification({
                  type: "update",
                  message: "Anuncio actualizado",
                });

                setAllAds((prev) => {
                  // Create a new array with the updated ad
                  const updated = prev
                    .map((ad) => (ad.id === payload.new.id ? payload.new : ad))
                    .filter((ad) => ad.active); // Remove deactivated ads

                  // Check if the currently displayed ad was updated
                  const currentAdUpdated =
                    currentAdIndexIndex < filteredAds.length &&
                    filteredAds[currentAdIndexIndex].id === payload.new.id;

                  // If the current ad was updated, force a re-render
                  if (currentAdUpdated) {
                    console.log("🔄 Current ad was updated, forcing re-render");
                    // Force fade transition to refresh the display
                    setFadeState("out");
                    setTimeout(() => {
                      setFadeState("in");
                    }, 300);
                  }

                  return updated;
                });
              } else if (payload.eventType === "DELETE") {
                setRealtimeNotification({
                  type: "delete",
                  message: "Anuncio eliminado",
                });
                setAllAds((prev) => {
                  const updated = prev.filter((ad) => ad.id !== payload.old.id);
                  return updated;
                });
              }

              // Clear notification after 3 seconds
              setTimeout(() => setRealtimeNotification(null), 3000);
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              setRealtimeStatus("connected");
            } else if (status === "CLOSED") {
              setRealtimeStatus("error");
            } else if (status === "CHANNEL_ERROR") {
              setRealtimeStatus("error");
            }
          });

        setLoading(false);
      } catch (err) {
        console.error("❌ Error setting up realtime subscription:", err);
        setError("Error al conectar con el sistema en tiempo real");
        setRealtimeStatus("error");
        setLoading(false);
      }
    }

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
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

  // Rotate advertisements with enhanced animations
  useEffect(() => {
    if (filteredAds.length === 0) return;

    const interval = setInterval(
      () => {
        if (showWeather) {
          // Weather is showing, go back to first ad
          setShowWeather(false);
          setcurrentAdIndexIndex(0);
        } else if (currentAdIndexIndex >= filteredAds.length - 1) {
          // Last ad, show weather next
          setShowWeather(true);
        } else {
          // Normal ad progression with enhanced animations
          setSlideDirection(Math.random() > 0.5 ? "next" : "prev");
          setBackgroundPattern((prev) => (prev + 1) % 3);

          setFadeState("out");

          setTimeout(() => {
            setcurrentAdIndexIndex(currentAdIndexIndex + 1);
            setFadeState("in");
          }, 800);
        }
      },
      showWeather ? 10000 : 7000
    ); // 10 seconds for weather, 7 for ads

    return () => clearInterval(interval);
  }, [currentAdIndexIndex, showWeather, filteredAds.length]); // Removed weatherData to fix dependency size issue

  const WeatherScreen = () => {
  console.log("🌤️ WeatherScreen component rendering...", {
    weatherData,
    isClient,
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

  console.log("✅ Weather data available, rendering full screen");
  const { current, forecast, location } = weatherData;

  return (
    <div className="w-full h-full flex flex-col relative overflow-auto">
      {/* Fondo Premium Profesional */}
      <div className="absolute inset-0">
        {/* Gradiente base profesional según el clima */}
        <div
          className={`absolute inset-0 transition-all duration-3000 ${
            current.icon === "☀️"
              ? "bg-gradient-to-br from-slate-900 via-blue-900/80 to-orange-900/40"
              : current.icon === "⛅" || current.icon === "🌤️"
              ? "bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900/60"
              : current.icon === "🌧️" || current.icon === "🌦️"
              ? "bg-gradient-to-br from-slate-900 via-slate-700 to-blue-800/50"
              : current.icon === "⛈️"
              ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600"
              : "bg-gradient-to-br from-slate-900 via-blue-900/80 to-orange-900/40"
          }`}
        >
          {/* Overlay de textura premium */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-orange-500/10"></div>
        </div>

        {/* Elementos animados profesionales */}
        {isClient && (
          <div className="absolute inset-0">
            {/* Soleado - partículas doradas sutiles */}
            {current.icon === "☀️" &&
              [...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-orange-300/40 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                  }}
                />
              ))}

            {/* Nublado - elementos geométricos sutiles */}
            {(current.icon === "⛅" ||
              current.icon === "☁️" ||
              current.icon === "🌤️") &&
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute opacity-10"
                  style={{
                    left: `${Math.random() * 90}%`,
                    top: `${Math.random() * 80}%`,
                    width: `${60 + i * 20}px`,
                    height: `${30 + i * 10}px`,
                    background: "linear-gradient(45deg, rgba(148, 163, 184, 0.3), rgba(203, 213, 225, 0.2))",
                    borderRadius: "50px",
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${4 + Math.random()}s`,
                  }}
                  
                />
              ))}

            {/* Lluvia - líneas elegantes */}
            {(current.icon === "🌧️" || current.icon === "🌦️") &&
              [...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-px h-6 bg-gradient-to-b from-blue-300/30 to-transparent"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `fall ${2 + Math.random()}s linear infinite`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                />
              ))}
          </div>
        )}
      </div>

      {/* Contenido del Tiempo */}
      <div className="relative z-10 flex flex-col h-full text-white">
        {/* Header Premium */}
        <div className="flex justify-between items-center p-4 bg-black/40 backdrop-blur-xl border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent">
              {location}
            </h1>
            <p className="text-slate-300 font-medium">Costa Brava • Tiempo en Vivo</p>
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

        {/* Display Principal del Tiempo */}
        <div className="flex-grow flex overflow-hidden py-6">
          {/* Temperatura Actual - Lado Izquierdo */}
          <div className="flex-1 flex flex-col justify-center items-center p-6">
            <div className="text-center">
              <div className="text-7xl mb-4 filter drop-shadow-2xl">
                {current.icon}
              </div>
              <div className="text-8xl font-light mb-3 bg-gradient-to-b from-white to-orange-200 bg-clip-text text-transparent filter drop-shadow-lg">
                {current.temp}°
              </div>
              <div className="text-2xl font-medium mb-4 capitalize text-slate-200">
                {current.description}
              </div>
              <div className="text-lg text-slate-300 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                Sensación térmica: <span className="font-semibold text-orange-300">{current.feels_like}°</span>
              </div>
            </div>
          </div>

          {/* Detalles del Tiempo - Lado Derecho */}
          <div className="flex-1 p-6">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
              Condiciones Actuales
            </h2>
            
            <div className="grid grid-cols-2 gap-4 text-base">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl filter drop-shadow-lg">💧</span>
                  <div>
                    <p className="text-slate-300 font-medium">Humedad</p>
                    <p className="text-2xl font-bold text-blue-300">{current.humidity}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl filter drop-shadow-lg">💨</span>
                  <div>
                    <p className="text-slate-300 font-medium">Viento</p>
                    <p className="text-2xl font-bold text-cyan-300">
                      {current.wind_speed} km/h
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl filter drop-shadow-lg">🔍</span>
                  <div>
                    <p className="text-slate-300 font-medium">Visibilidad</p>
                    <p className="text-2xl font-bold text-green-300">
                      {current.visibility} km
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl filter drop-shadow-lg">📊</span>
                  <div>
                    <p className="text-slate-300 font-medium">Presión</p>
                    <p className="text-2xl font-bold text-purple-300">
                      {current.pressure} mb
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amanecer/Atardecer Premium */}
            <div className="mt-6 bg-gradient-to-r from-orange-900/30 to-blue-900/30 backdrop-blur-md rounded-2xl p-4 border border-orange-500/20">
              <div className="flex justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl filter drop-shadow-lg">🌅</span>
                  <div>
                    <p className="text-slate-300 font-medium">Amanecer</p>
                    <p className="text-xl font-bold text-orange-300">
                      {current.sunrise?.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-3xl filter drop-shadow-lg">🌇</span>
                  <div>
                    <p className="text-slate-300 font-medium">Atardecer</p>
                    <p className="text-xl font-bold text-orange-400">
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

        {/* Previsión de 7 Días Premium */}
        <div className="bg-black/40 backdrop-blur-xl py-4 px-6 border-t border-white/10">
          <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent">
            Previsión Semanal
          </h2>
          <div className="flex justify-between space-x-2 overflow-x-auto pb-2">
            {forecast.slice(0, 7).map((day, index) => (
              <div
                key={index}
                className="flex-1 min-w-[100px] text-center bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 hover:bg-white/15 transition-all duration-300"
              >
                <p className="text-sm font-semibold mb-2 text-slate-300">
                  {index === 0
                    ? "Hoy"
                    : index === 1
                    ? "Mañana"
                    : day.date.toLocaleDateString("es-ES", {
                        weekday: "short",
                      })}
                </p>
                <div className="text-3xl mb-2 filter drop-shadow-lg">{day.icon}</div>
                <div className="text-lg font-bold text-white">
                  <span className="text-orange-300">{day.temp_max}°</span> / <span className="text-blue-300">{day.temp_min}°</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 capitalize truncate">
                  {day.description}
                </p>
                <div className="flex justify-center space-x-2 mt-2 text-xs text-slate-400">
                  <span className="flex items-center">
                    <span className="text-blue-400">💧</span>{day.humidity}%
                  </span>
                  <span className="flex items-center">
                    <span className="text-cyan-400">💨</span>{day.wind_speed}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animaciones CSS personalizadas */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100vh) rotate(10deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(10deg);
            opacity: 0;
          }
        }
        
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

  const LoadingScreen = () => (
    <div className="flex flex-col h-screen bg-black relative overflow-hidden">
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

      {/* Header */}
      <header
        className="relative z-10 py-4 px-6"
        style={{ background: GRADIENT }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 bg-orange-500 rounded-full animate-spin"></div>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">
              Publi-Taxi
            </h1>
          </div>
          <div className="text-white/90 text-lg font-medium">
            Sistema Publicitario Digital
          </div>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center relative z-10">
        <div className="text-center">
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

      <footer className="relative z-10 py-3 px-6 bg-black/50 backdrop-blur-sm">
        <div className="text-center text-white/70">
          © 2025 Publi-Taxi - Tecnología Avanzada
        </div>
      </footer>
    </div>
  );

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-700 relative overflow-hidden">
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

        <header className="relative z-10 py-4 px-6 bg-red-600">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Publi-Taxi</h1>
            <div className="text-red-100">Sistema en Mantenimiento</div>
          </div>
        </header>

        <div className="flex-grow flex flex-col items-center justify-center relative z-10 text-center px-8">
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-8 animate-pulse">
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

        <footer className="relative z-10 py-3 px-6 bg-red-800/50 backdrop-blur-sm">
          <div className="text-center text-red-100">
            © 2025 Publi-Taxi - Soporte Técnico Disponible
          </div>
        </footer>
      </div>
    );
  }

  // Handle no ads for current time slot
  if (filteredAds.length === 0) {
    const timeSlotName = TIME_SLOTS[currentTimeSlot]?.name || "actual";
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
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

        <header
          className="relative z-10 py-4 px-6"
          style={{ background: GRADIENT }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
              </div>
              <h1 className="text-2xl font-bold text-white">Publi-Taxi</h1>
            </div>
            <div className="text-white/90 flex items-center space-x-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                {timeSlotName}
              </span>
              <span className="text-lg">
                {currentTime.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-grow flex flex-col items-center justify-center relative z-10 px-8">
          <div className="text-center max-w-4xl">
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

        <footer className="relative z-10 py-3 px-6 bg-black/30 backdrop-blur-sm">
          <div className="text-center text-white/70">
            © 2025 Developed on the Costa Brava by VisitToo & VisitTech
          </div>
        </footer>
      </div>
    );
  }

  const currentAdIndex = filteredAds[currentAdIndexIndex];

  return (
    <div className="flex flex-col h-screen bg-black relative overflow-hidden">
      {/* Debug Panel - Temporal */}
      {/* <div className="fixed top-20 left-4 bg-black/80 text-white p-4 rounded-lg z-50 text-sm">
        <h3 className="font-bold mb-2">🔍 Debug Info</h3>
        <p>📊 Total ads: {filteredAds.length}</p>
        <p>📍 Current index: {currentAdIndexIndex}</p>
        <p>🌤️ Show weather: {showWeather ? 'YES' : 'NO'}</p>
        <p>📋 Weather data: {weatherData ? 'LOADED ✅' : weatherLoading ? 'LOADING...' : 'NOT LOADED ❌'}</p>
        <p>🎯 Next action: {
          showWeather ? 'Hide weather → Ad 1' :
          currentAdIndexIndex >= filteredAds.length - 1 ? 'Show weather' :
          `Show ad ${currentAdIndexIndex + 2}`
        }</p>
        <div className="mt-3 text-xs opacity-70">
          <p>Sequence should be:</p>
          {filteredAds.map((ad, i) => (
            <span key={i} className={currentAdIndexIndex === i && !showWeather ? 'text-green-400' : ''}>
              Ad{i+1} → 
            </span>
          ))}
          <span className={showWeather ? 'text-green-400' : ''}>Weather → </span>
          <span>Repeat</span>
        </div>
        
        <button
          onClick={() => {
            console.log('🔄 Manual weather refresh triggered');
            refreshWeatherData();
          }}
          className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
        >
          🔄 Force Weather Refresh
        </button>
      </div> */}
      {/* End Debug Panel */}
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

      {/* Premium Header */}
      <header
        className="relative z-20 py-2 px-6 backdrop-blur-md"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 128, 0, 0.95) 0%, rgba(255, 107, 0, 0.95) 50%, rgba(229, 90, 0, 0.95) 100%)",
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">
                Publi-Taxi
              </h1>
              <p className="text-white/80 text-sm">
                Premium Digital Advertising
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-white">
            {/* Realtime Status Indicator */}
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  realtimeStatus === "connected"
                    ? "bg-green-400 animate-pulse"
                    : realtimeStatus === "connecting"
                    ? "bg-yellow-400 animate-pulse"
                    : "bg-red-400 animate-pulse"
                }`}
              ></div>
              <span className="text-sm font-medium">
                {realtimeStatus === "connected"
                  ? "En Vivo"
                  : realtimeStatus === "connecting"
                  ? "Conectando..."
                  : "Desconectado"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-white p-2 rounded-lg shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(`${window.location.origin}/language-selector`)}`}
                  alt="Language Selector QR"
                  className="w-8 h-8"
                />
              </div>
              <span className="text-sm font-medium">Idiomas</span>
            </div>

            {/* Debug weather button - temporary for testing 
            <button
              onClick={() => {
                console.log('🌤️ Manual weather toggle clicked');
                setShowWeather(!showWeather);
                console.log('Weather state changed to:', !showWeather);
              }}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm font-medium transition-colors"
            >
              {showWeather ? '📺 Ads' : '🌤️ Tiempo'}
            </button>
            
            <div className="text-center">
              <p className="text-sm font-medium opacity-90">Debug Info</p>
              <p className="text-lg font-bold">{showWeather ? '🌤️ Tiempo' : `📺 Ad ${currentAdIndexIndex + 1}/${filteredAds.length}`}</p>
            </div>*/}

            <div className="text-center">
              <p className="text-sm font-medium opacity-90">Franja Horaria</p>
              <p className="text-lg font-bold">
                {TIME_SLOTS[currentTimeSlot]?.name}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium opacity-90">Hora Actual</p>
              <p className="text-2xl font-bold font-mono">
                {currentTime.toLocaleTimeString("es-ES", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium opacity-90">Anuncios</p>
              <p className="text-lg font-bold">
                {filteredAds.length > 0
                  ? `${currentAdIndexIndex + 1}/${filteredAds.length}`
                  : "0/0"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow relative flex flex-col items-center justify-center px-6 py-4">
        {showWeather ? (
          <div
            className={`w-full h-full transition-all duration-800 ease-in-out transform ${
              fadeState === "in"
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-8"
            }`}
          >
            <WeatherScreen />
          </div>
        ) : (
          currentAdIndex && (
            <div
              className={`w-full max-w-7xl transition-all duration-800 ease-in-out transform ${
                fadeState === "in"
                  ? "opacity-100 scale-100 translate-y-0"
                  : `opacity-0 scale-95 ${
                      slideDirection === "next"
                        ? "translate-y-8"
                        : "-translate-y-8"
                    }`
              }`}
            >
              {/* Media Container with advanced styling - Title removed to maximize media size */}
              <div className="relative w-full mb-2 rounded-3xl overflow-hidden shadow-2xl" style={{ maxHeight: "calc(100vh - 150px)" }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-10"></div>

                {currentAdIndex.media_url ? (
                  currentAdIndex.media_type === "video" ? (
                    <div className="relative">
                      <video
                        className="w-full h-full object-contain"
                        src={currentAdIndex.media_url}
                        autoPlay
                        muted
                        loop
                        style={{ maxHeight: "calc(100vh - 150px)" }}
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
                                  className="w-16 h-16 rounded-lg"
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
                    <div className="relative w-full" style={{ maxWidth: "100%", maxHeight: "calc(100vh - 150px)" }}>
                      {/* 16:9 aspect ratio container (9/16 = 0.5625 or 56.25%) */}
                      <div className="relative w-full pb-[56.25%] overflow-hidden bg-black">
                        <img
                          className="absolute inset-0 w-full h-full object-contain"
                          src={currentAdIndex.media_url}
                          alt={currentAdIndex.title}
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
                                  className="w-16 h-16 rounded-lg"
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


      {/* Premium Footer */}
      <footer className="relative z-20 py-2 px-6 bg-black/80 backdrop-blur-md">
        <div className="flex justify-between items-center text-white/90">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full"></div>
            <span className="font-medium">© 2025 Publi-Taxi</span>
          </div>
          <div className="text-center flex-grow">
            <span className="text-sm">Developed on the Costa Brava by </span>
            <span className="font-semibold text-orange-400">
              VisitToo & VisitTech
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full animate-pulse ${
                realtimeStatus === "connected"
                  ? "bg-green-400"
                  : realtimeStatus === "connecting"
                  ? "bg-yellow-400"
                  : "bg-red-400"
              }`}
            ></div>
            <span className="text-sm font-medium">
              {realtimeStatus === "connected"
                ? "Sincronización Activa"
                : realtimeStatus === "connecting"
                ? "Conectando Sistema..."
                : "Sistema Desconectado"}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
