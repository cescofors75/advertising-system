"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";
import {
  LayoutDashboard,
  Users,
  LogOut,
  User,
  Monitor,
  Palette,
} from "lucide-react";
import { Calculator, Car } from "lucide-react";
import {deviceService} from "@/services/deviceService";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserTooltip, setShowUserTooltip] = useState(false);
  const [onlineDevicesCount, setOnlineDevicesCount] = useState(0);
  const router = useRouter();

  // Obtener información del usuario
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        setLoading(true);

        // Obtener usuario actual
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error al obtener usuario:", userError);
          return;
        }

        if (!user) {
          console.error("No hay sesión de usuario");
          return;
        }

        setCurrentUser(user);

        // Obtener perfil del usuario
        const { data: profileData, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (profileError) {
          console.error("Error al obtener perfil:", profileError);
          return;
        }

        if (!profileData) {
          console.error("No se encontró perfil para el usuario");
          return;
        }

        setUserProfile(profileData);
      } catch (err) {
        console.error("Error al obtener información del usuario:", err);
      } finally {
        setLoading(false);
      }
    };

    getUserInfo();
  }, []);

  // Obtener conteo de dispositivos online
  // Obtener conteo de dispositivos online
useEffect(() => {
  const fetchOnlineDevicesCount = async () => {
    try {
      const count = await deviceService.getOnlineDevicesCount();
      setOnlineDevicesCount(count);
    } catch (err) {
      console.error("Error al obtener dispositivos online:", err);
    }
  };

  // Fetch inicial
  fetchOnlineDevicesCount();

  // Actualizar cada UPDATE_INTERVAL_SECONDS segundos
  const interval = setInterval(fetchOnlineDevicesCount, deviceService.UPDATE_INTERVAL_SECONDS * 1000);

  // Configurar suscripción realtime para actualizaciones instantáneas
  const channel = supabase
    .channel('devices-count-layout')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'connected_devices' }, 
      () => {
        // Cuando hay cambios, actualizar el conteo
        fetchOnlineDevicesCount();
      }
    )
    .subscribe();

  return () => {
    clearInterval(interval);
    supabase.removeChannel(channel);
  };
}, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Cerrar el tooltip al hacer clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (showUserTooltip && !event.target.closest(".user-profile-button")) {
        setShowUserTooltip(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserTooltip]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        {/* Navegación superior */}
        <nav className="bg-slate-900/80 backdrop-blur-md shadow-lg border-b border-slate-700/50 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center overflow-x-auto hide-scrollbar">
                <div className="flex-shrink-0 flex items-center">
                  <Link
                    href="/admin"
                    className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400"
                  >
                    Panel de Administración
                  </Link>
                </div>
                <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                  <Link
                    href="/admin"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === "/admin"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Anuncios
                  </Link>
                   <Link
                    href="/display"
                    target="_blank"
                    className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Display
                  </Link>
                  {/*<Link
                    href="/admin/usuarios"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === "/admin/usuarios"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Usuarios
                  </Link>*/}
                 
                  <Link
                    href="/admin/studio"
                    className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculator
                  </Link>

                  <Link
                    href="/admin/realtime"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                      pathname === "/admin/realtime"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Cars
                    {onlineDevicesCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-white">
                        {onlineDevicesCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Información del usuario con tooltip */}
                {!loading && currentUser && userProfile && (
                  <div className="relative">
                    <button
                      className="user-profile-button flex items-center bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-lg px-3 py-2 transition-colors"
                      onClick={() => setShowUserTooltip(!showUserTooltip)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold mr-2">
                        {userProfile.first_name
                          ? userProfile.first_name.charAt(0)
                          : currentUser.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden md:inline">
                        {userProfile.first_name ||
                          currentUser.email.split("@")[0]}
                      </span>
                      <User className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 border border-red-500/30 px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Navegación móvil - visible solo en móviles */}
        <div className="sm:hidden bg-slate-900/50 border-b border-slate-700/50 overflow-x-auto hide-scrollbar">
          <div className="flex space-x-2 p-2">
            <Link
              href="/admin"
              className={`flex-shrink-0 inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/admin"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Anuncios
            </Link>
             <Link
              href="/display"
              target="_blank"
              className="flex-shrink-0 inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <Monitor className="w-4 h-4 mr-2" />
              Display
            </Link>
           {/* <Link
              href="/admin/usuarios"
              className={`flex-shrink-0 inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/admin/usuarios"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Usuarios
            </Link>*/}
           
            
            <Link
              href="/admin/studio"
              className="flex-shrink-0 inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculator
            </Link>

            <Link
              href="/admin/realtime"
              className={`flex-shrink-0 inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                pathname === "/admin/realtime"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Car className="w-4 h-4 mr-2" />
              Cars
              {onlineDevicesCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-500 text-white">
                  {onlineDevicesCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Portal para el tooltip de usuario - fuera del flujo normal para evitar problemas de z-index */}
        {showUserTooltip && !loading && currentUser && userProfile && (
          <div className="fixed inset-0 z-[9999] pointer-events-none">
            <div
              className="absolute right-4 top-16 w-64 bg-slate-800 border border-slate-700 shadow-xl rounded-xl p-4 pointer-events-auto"
              style={{ maxWidth: "calc(100vw - 2rem)" }}
            >
              <div className="text-sm">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold mr-3">
                    {userProfile.first_name
                      ? userProfile.first_name.charAt(0)
                      : currentUser.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white">
                      {userProfile.first_name} {userProfile.last_name}
                    </p>
                    <p
                      className={`text-xs ${
                        userProfile.role === "admin"
                          ? "text-purple-400"
                          : userProfile.role === "editor"
                          ? "text-green-400"
                          : "text-blue-400"
                      }`}
                    >
                      {userProfile.role === "admin"
                        ? "Administrador"
                        : userProfile.role === "editor"
                        ? "Editor"
                        : "Visualizador"}
                    </p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1">
                    Correo electrónico
                  </p>
                  <p className="text-white">{currentUser.email}</p>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-slate-400 mb-1">ID de usuario</p>
                  <p className="text-slate-300 text-xs truncate">
                    {currentUser.id}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-400">
                    Último acceso:{" "}
                    {currentUser.last_sign_in_at
                      ? new Date(currentUser.last_sign_in_at).toLocaleString()
                      : "No disponible"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <main>{children}</main>
      </div>

      {/* Estilos adicionales para ocultar la barra de desplazamiento */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE y Edge */
          scrollbar-width: none; /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari y Opera */
        }
      `}</style>
    </AuthGuard>
  );
}