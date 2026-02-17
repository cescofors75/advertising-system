"use client";

import { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  LogOut,
  Monitor,
  Car,
  Activity,
} from "lucide-react";


export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ redirect: false });
      router.push("/auth/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

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
                    href="/admin/realtime"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === "/admin/realtime"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Realtime
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

                  {/*<Link
                    href="/admin/studio"
                    className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculator
                  </Link>*/}

                  {/*<Link
                    href="/admin/realtime"
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                      pathname === "/admin/realtime"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Cars
                  </Link>*/}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Información del usuario */}
                {status === 'authenticated' && session?.user && (
                  <div className="flex items-center bg-slate-800/50 text-slate-300 rounded-lg px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold mr-2">
                      P
                    </div>
                    <span className="hidden md:inline text-sm">
                      {session.user.name}
                    </span>
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

            {/*<Link
              href="/admin/studio"
              className="flex-shrink-0 inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculator
            </Link>*/}

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
            </Link>
          </div>
        </div>

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