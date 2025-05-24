"use client";

import Link from "next/link";
import { Monitor, Users, Shield, Car } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-6 leading-tight">
            Sistema de Publicidad Digital
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Una solución completa para gestionar y mostrar anuncios digitales
            en pantallas. Taxis, Hoteles, Restaurantes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-16">
          {/* Display System Card */}
          <div className="bg-slate-800/80 backdrop-blur rounded-xl shadow-xl border border-slate-700/50 overflow-hidden transition-all hover:shadow-2xl transform hover:scale-[1.02]">
            <div className="p-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-5 shadow-lg">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500 mb-3">Sistema de Visualización</h2>
              <p className="text-slate-300 mb-8">
                El componente de cara al público que muestra sus anuncios en una 
                presentación automática a pantalla completa. Ideal para pantallas públicas y 
                señalización digital con soporte para imágenes y vídeos.
              </p>
              <ul className="mb-8 space-y-2 text-slate-400">
                <li className="flex items-center">
                  <div className="mr-2 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <span className="text-green-400 text-xs">✓</span>
                  </div>
                  Rotación automática entre anuncios
                </li>
                <li className="flex items-center">
                  <div className="mr-2 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <span className="text-green-400 text-xs">✓</span>
                  </div>
                  Soporte para imágenes y vídeos
                </li>
                <li className="flex items-center">
                  <div className="mr-2 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <span className="text-green-400 text-xs">✓</span>
                  </div>
                  Diseño adaptable para cualquier tamaño de pantalla
                </li>
              </ul>
              <Link 
                href="/display" 
                className="inline-block w-full text-center py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Iniciar Sistema de Visualización
              </Link>
            </div>
          </div>
          
          {/* Admin Panel Card */}
          <div className="bg-slate-800/80 backdrop-blur rounded-xl shadow-xl border border-slate-700/50 overflow-hidden transition-all hover:shadow-2xl transform hover:scale-[1.02]">
            <div className="p-8">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-5 shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-3">Panel de Administración</h2>
              <p className="text-slate-300 mb-8">
                La interfaz de gestión que le permite crear, editar, programar y 
                eliminar anuncios. Suba contenido multimedia, configure tiempos de visualización y previsualice 
                cómo se verán sus anuncios en pantalla.
              </p>
              <ul className="mb-8 space-y-2 text-slate-400">
                <li className="flex items-center">
                  <div className="mr-2 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <span className="text-green-400 text-xs">✓</span>
                  </div>
                  Funcionalidad completa de gestión de anuncios
                </li>
                <li className="flex items-center">
                  <div className="mr-2 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <span className="text-green-400 text-xs">✓</span>
                  </div>
                  Capacidades de subida y programación de contenido
                </li>
                <li className="flex items-center">
                  <div className="mr-2 w-5 h-5 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <span className="text-green-400 text-xs">✓</span>
                  </div>
                  Herramientas de previsualización y gestión
                </li>
              </ul>
              <Link 
                href="/admin" 
                className="inline-block w-full text-center py-3 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Acceder al Panel de Administración
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-slate-400 flex items-center justify-center">
            <Shield className="w-4 h-4 mr-2" />
            Developed on the Costa Brava by VisitToo & VisitTech
          </p>
        </div>
      </div>
    </div>
  );
}
