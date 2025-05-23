import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Sistema de Publicidad Digital
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Una solución completa para gestionar y mostrar anuncios digitales
            en pantallas. Taxis,  Hoteles, Restaurantes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-16">
          {/* Display System Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden transition-all hover:shadow-2xl">
            <div className="p-8">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-5">
                <svg 
                  className="w-6 h-6 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Sistema de Visualización</h2>
              <p className="text-gray-600 mb-8">
                El componente de cara al público que muestra sus anuncios en una 
                presentación automática a pantalla completa. Ideal para pantallas públicas y 
                señalización digital con soporte para imágenes y vídeos.
              </p>
              <ul className="mb-8 space-y-2 text-gray-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Rotación automática entre anuncios
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Soporte para imágenes y vídeos
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Diseño adaptable para cualquier tamaño de pantalla
                </li>
              </ul>
              <Link 
                href="/display" 
                className="inline-block w-full text-center py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Iniciar Sistema de Visualización
              </Link>
            </div>
          </div>
          
          {/* Admin Panel Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden transition-all hover:shadow-2xl">
            <div className="p-8">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-5">
                <svg 
                  className="w-6 h-6 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Panel de Administración</h2>
              <p className="text-gray-600 mb-8">
                La interfaz de gestión que le permite crear, editar, programar y 
                eliminar anuncios. Suba contenido multimedia, configure tiempos de visualización y previsualice 
                cómo se verán sus anuncios en pantalla.
              </p>
              <ul className="mb-8 space-y-2 text-gray-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Funcionalidad completa de gestión de anuncios
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Capacidades de subida y programación de contenido
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Herramientas de previsualización y gestión
                </li>
              </ul>
              <Link 
                href="/admin" 
                className="inline-block w-full text-center py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Acceder al Panel de Administración
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-500">
           Developed on the Costa Brava by VisitToo & VisitTech
          </p>
        </div>
      </div>
    </div>
  );
}